from pyannote.audio import Model
from pyannote.audio import Inference
from ..config import settings
from ..logger import logger
import numpy as np
from typing import Optional

try:
    model = Model.from_pretrained(
        "pyannote/wespeaker-voxceleb-resnet34-LM",
        use_auth_token=settings.hugging_face_token
    )
    inference = Inference(model, window="whole")
    logger.info("Successfully loaded speaker embedding model.")
except Exception as e:
    logger.error(f"Failed to load speaker embedding model: {e}")
    inference = None

def get_embedding_from_file(filepath: str) -> Optional[np.ndarray]:
    """
    Generates a speaker embedding from a given audio file path.
    """
    if inference is None:
        logger.error("Speaker embedding model is not available.")
        return None
    try:
        embedding = inference(filepath)
        return embedding
    except Exception as e:
        logger.error(f"Error generating speaker embedding: {e}")
        return None 