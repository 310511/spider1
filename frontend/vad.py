import numpy as np
import torch
torch.set_num_threads(1)
import threading
import wave
import os
from datetime import datetime
import sys
import time
from contextlib import contextmanager
import requests

# Add the project root to the Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.logger import logger

@contextmanager
def suppress_stderr():
    with open(os.devnull, "w") as devnull:
        old_stderr = sys.stderr
        sys.stderr = devnull
        try:
            yield
        finally:
            sys.stderr = old_stderr

# Try to import pyaudio with error suppression
try:
    with suppress_stderr():
        import pyaudio
    PYAUDIO_AVAILABLE = True
    logger.info("PyAudio successfully imported")
except Exception as e:
    PYAUDIO_AVAILABLE = False
    logger.warning(f"PyAudio not available or failed to import: {e}")

FORMAT = pyaudio.paInt16 if PYAUDIO_AVAILABLE else None
CHANNELS = 1
SAMPLE_RATE = 16000
CHUNK = 512  # VAD model expects exactly 512 samples for 16000 Hz
VAD_THRESHOLD = 0.85  # High threshold for voice detection
SILENCE_DURATION = 2.0  # Seconds of silence before stopping recording
MIN_SPEECH_DURATION = 1.0  # Minimum duration to consider as valid speech
SNR_THRESHOLD = 10  # Minimum SNR in dB for audio to be saved
MAX_RECORDING_DURATION = 30.0  # Maximum recording duration in seconds

# Backend API configuration
BACKEND_API_URL = "http://localhost:8000"
# Use a relative path for the audio directory, defined once
AUDIOS_DIR = os.path.join(os.path.dirname(__file__), "audios")

# Global variables for audio recording
model = None
utils = None
audio = None
is_listening = False
current_recording = None
audio_buffer = []
speech_detected = False
silence_counter = 0
current_username = None

def initialize_vad():
    """Initializes the VAD model and audio system, returns True on success."""
    global model, utils, audio
    
    if model is None:
        try:
            model, _ = torch.hub.load(repo_or_dir='snakers4/silero-vad', model='silero_vad', force_reload=False)
        except Exception as e:
            print(f"Error loading VAD model: {e}")
            return False

    if PYAUDIO_AVAILABLE and audio is None:
        try:
            with suppress_stderr():
                audio = pyaudio.PyAudio()
            with suppress_stderr():
                if audio.get_default_input_device_info():
                    print("Default input device found.")
        except Exception as e:
            print(f"Could not initialize PyAudio, voice recording disabled: {e}")
            audio = None
            return False
            
    return True

def validate(model, inputs: torch.Tensor):
    """Validate audio input with VAD model"""
    with torch.no_grad():
        outs = model(inputs)
    return outs

def int2float(sound):
    """Convert int16 audio to float32"""
    abs_max = np.abs(sound).max()
    sound = sound.astype('float32')
    if abs_max > 0:
        sound *= 1/32768
    sound = sound.squeeze()
    return sound

def calculate_snr(audio_data):
    """Calculate Signal-to-Noise Ratio (SNR) in dB for audio data"""
    if not audio_data:
        return 0.0
    
    # Combine all audio chunks into one array
    combined_audio = np.concatenate([np.frombuffer(chunk, dtype=np.int16) for chunk in audio_data])
    audio_float = int2float(combined_audio)
    
    # Calculate signal power (RMS of the entire signal)
    signal_power = np.mean(audio_float ** 2)
    
    # Estimate noise power using the quieter segments (bottom 20% of signal power)
    # We use a sliding window to find quieter segments
    window_size = min(1024, len(audio_float) // 10)  # Adaptive window size
    if window_size < 100:  # Too short to analyze
        return 0.0
    
    windowed_powers = []
    for i in range(0, len(audio_float) - window_size, window_size // 2):
        window = audio_float[i:i + window_size]
        windowed_powers.append(np.mean(window ** 2))
    
    if len(windowed_powers) < 2:
        return 0.0
    
    # Use the 20th percentile as noise floor estimation
    noise_power = np.percentile(windowed_powers, 20)
    
    # Avoid division by zero
    if noise_power <= 0 or signal_power <= 0:
        return 0.0
    
    # Calculate SNR in dB
    snr_db = 10 * np.log10(signal_power / noise_power)
    return snr_db

def _save_audio_file(audio_data: list, patient_username: str):
    """Internal function to save an audio file and trigger backend processing."""
    try:
        os.makedirs(AUDIOS_DIR, exist_ok=True)
        filename = f"{patient_username}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        filepath = os.path.join(AUDIOS_DIR, filename)
        
        with wave.open(filepath, 'wb') as wf:
            wf.setnchannels(CHANNELS)
            wf.setsampwidth(2)
            wf.setframerate(SAMPLE_RATE)
            wf.writeframes(b''.join(audio_data))
        logger.info(f"VAD saved audio chunk to {filepath}")

        # Call the backend API to process this file immediately
        api_url = f"{BACKEND_API_URL}/process-audio"
        payload = {"user_id": patient_username, "filepath": filepath}
        
        # We run this in a separate thread so it doesn't block the VAD loop
        thread = threading.Thread(target=requests.post, kwargs={'url': api_url, 'json': payload, 'timeout': 60})
        thread.start()
        
    except Exception as e:
        logger.error(f"VAD error during save or process trigger: {e}")

def continuous_voice_detection(patient_username: str):
    """Continuously listens for voice and triggers processing."""
    global is_listening, current_username
    current_username = patient_username

    if not PYAUDIO_AVAILABLE or audio is None or model is None:
        logger.error("Audio system or VAD model not available. Stopping VAD thread.")
        is_listening = False
        return

    stream = None
    audio_buffer = []
    speech_detected = False
    silence_counter = 0
    recording_start_time = None

    try:
        with suppress_stderr():
            stream = audio.open(format=FORMAT,
                               channels=CHANNELS,
                               rate=SAMPLE_RATE,
                               input=True,
                               frames_per_buffer=CHUNK)
        
        print(f"Audio stream opened successfully for user: {patient_username}")

        while is_listening:
            audio_chunk = stream.read(CHUNK, exception_on_overflow=False)
            if not audio_chunk: continue
            
            audio_int16 = np.frombuffer(audio_chunk, dtype=np.int16)
            if len(audio_int16) == 0: continue

            audio_float32 = int2float(audio_int16)
            
            # This check is critical to prevent crashes if the model failed to load
            if model is None:
                time.sleep(1)
                continue
            
            confidence = model(torch.from_numpy(audio_float32), SAMPLE_RATE).item()

            if confidence > VAD_THRESHOLD:
                if not speech_detected:
                    print(f"Voice detected (confidence: {confidence:.2f})")
                    speech_detected = True
                    recording_start_time = time.time()
                    audio_buffer = [] 
                audio_buffer.append(audio_chunk)
                silence_counter = 0
                
                # Check for maximum recording duration
                if recording_start_time and time.time() - recording_start_time > MAX_RECORDING_DURATION:
                    print(f"Maximum recording duration reached, processing audio...")
                    recording_duration = len(audio_buffer) * CHUNK / SAMPLE_RATE
                    if recording_duration >= MIN_SPEECH_DURATION:
                        _save_audio_file(audio_buffer, patient_username)
                    speech_detected = False
                    audio_buffer = []
                    silence_counter = 0
                    recording_start_time = None
                    
            elif speech_detected:
                silence_counter += 1
                audio_buffer.append(audio_chunk)
                
                if silence_counter > (SILENCE_DURATION * (SAMPLE_RATE / CHUNK)):
                    recording_duration = len(audio_buffer) * CHUNK / SAMPLE_RATE
                    if recording_duration >= MIN_SPEECH_DURATION:
                        _save_audio_file(audio_buffer, patient_username)
                    else:
                        print(f"Audio too short, discarded ({recording_duration:.1f}s)")
                    speech_detected = False
                    audio_buffer = []
                    silence_counter = 0
                    recording_start_time = None

    except Exception as e:
        print(f"Error in audio stream: {e}. Retrying in 5 seconds...")
        time.sleep(5)
    finally:
        if stream:
            try:
                stream.stop_stream()
                stream.close()
            except: pass

def start_background_listening(patient_username: str):
    """Starts the continuous voice detection in a background thread."""
    global is_listening, current_username
    if is_listening and current_username == patient_username:
        print(f"Already listening for user: {patient_username}")
        return True
        
    if is_listening and current_username != patient_username:
        print(f"Switching listening from {current_username} to {patient_username}")
        stop_listening()
        time.sleep(1)  # Give time for the previous thread to stop
    
    if not is_listening:
        if initialize_vad() and PYAUDIO_AVAILABLE and audio is not None:
            is_listening = True
            current_username = patient_username
            thread = threading.Thread(target=continuous_voice_detection, args=(patient_username,), daemon=True)
            thread.start()
            print(f"Background listening thread started for user: {patient_username}")
            return True
    print("Could not start background listening.")
    return False

def stop_listening():
    """Stops the voice detection thread."""
    global is_listening, current_username
    if is_listening:
        is_listening = False
        current_username = None
        print("Stopping voice detection.")
        time.sleep(1)  # Give time for the thread to stop

def is_currently_listening():
    """Checks if the voice detection thread is active."""
    return is_listening

def get_current_listening_user():
    """Returns the username of the currently listening user."""
    return current_username if is_listening else None

def get_audio_system_status():
    """Returns True if the audio system is ready for recording."""
    return PYAUDIO_AVAILABLE and audio is not None

def get_backend_status():
    """Returns True if backend services are available."""
    return False

def set_snr_threshold(new_threshold):
    """Set a new SNR threshold for audio quality filtering."""
    global SNR_THRESHOLD
    SNR_THRESHOLD = float(new_threshold)
    print(f"SNR threshold updated to {SNR_THRESHOLD} dB")

def get_snr_threshold():
    """Get the current SNR threshold."""
    return SNR_THRESHOLD

def set_vad_threshold(new_threshold):
    """Set a new VAD threshold for voice detection sensitivity."""
    global VAD_THRESHOLD
    VAD_THRESHOLD = float(new_threshold)
    print(f"VAD threshold updated to {VAD_THRESHOLD}")

def get_vad_threshold():
    """Get the current VAD threshold."""
    return VAD_THRESHOLD

def save_audio_file(audio_data, patient_username):
    """Saves audio data to a WAV file only if SNR is above threshold."""
    snr_db = calculate_snr(audio_data)
    if snr_db < SNR_THRESHOLD:
        return False
    
    _save_audio_file(audio_data, patient_username)
    return True