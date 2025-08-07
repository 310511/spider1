from ..clients import elevenlabs_client
from ..logger import logger
from io import BytesIO
from typing import Optional

def speech_to_text(audio_data: bytes) -> Optional[str]:
    """
    Transcribes audio data using ElevenLabs Speech-to-Text.
    """
    try:
        # The API expects a file-like object, so we wrap the bytes in BytesIO
        audio_file = BytesIO(audio_data)
        
        transcription = elevenlabs_client.speech_to_text.convert(
            file=audio_file,
            model_id="scribe_v1", # Corrected model ID for transcription
        )
        logger.info(f"Transcription successful. Text: '{transcription.text}'")
        return transcription.text
    except Exception as e:
        logger.error(f"Error during ElevenLabs transcription: {e}")
        return None

def text_to_speech(text: str) -> Optional[bytes]:
    """
    Converts text to speech using ElevenLabs Text-to-Speech.
    Returns the audio data as bytes.
    """
    try:
        # The result is an iterator of audio chunks (bytes)
        audio_stream = elevenlabs_client.text_to_speech.convert(
            text=text,
            voice_id="JBFqnCBsd6RMkjVDRZzb",  # A default calm, male voice
            model_id="eleven_multilingual_v2",
        )
        
        # Concatenate the chunks into a single bytes object
        audio_bytes = b"".join(audio_stream)
        logger.info("Text-to-speech conversion successful.")
        return audio_bytes
    except Exception as e:
        logger.error(f"Error during ElevenLabs text-to-speech: {e}")
        return None 