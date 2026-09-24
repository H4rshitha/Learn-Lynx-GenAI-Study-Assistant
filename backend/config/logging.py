import logging
import sys
from backend.config.settings import settings


def setup_logging():
    """
    Configure application-wide structured logging format and handlers.
    """
    log_level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    
    # Root logger configuration
    logging.basicConfig(
        level=log_level,
        format=settings.LOG_FORMAT,
        handlers=[
            logging.StreamHandler(sys.stdout),
        ],
    )

    # Adjust external noisy libraries
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("chromadb").setLevel(logging.WARNING)
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)

    logger = logging.getLogger("learnlynx")
    logger.setLevel(log_level)
    return logger


logger = setup_logging()
