import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings(BaseModel):
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    DEBUG: bool = os.getenv("DEBUG", "False").lower() in ("true", "1", "t")
    CORS_ORIGINS: list[str] = [
        origin.strip() 
        for origin in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")
        if origin.strip()
    ]
    
    # Path to face landmarker model
    MODEL_PATH: str = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "face_landmarker.task"))

    # Configurable detection parameters
    DEFAULT_EAR_THRESHOLD: float = float(os.getenv("DEFAULT_EAR_THRESHOLD", "0.20"))
    PROLONGED_CLOSURE_SECONDS: float = float(os.getenv("PROLONGED_CLOSURE_SECONDS", "1.5"))
    EAR_REOPEN_THRESHOLD: float = float(os.getenv("EAR_REOPEN_THRESHOLD", "0.23"))
    MAR_THRESHOLD: float = float(os.getenv("MAR_THRESHOLD", "0.65"))
    YAWN_MIN_SECONDS: float = float(os.getenv("YAWN_MIN_SECONDS", "2.0"))
    MAX_FPS: int = int(os.getenv("MAX_FPS", "10"))

settings = Settings()
