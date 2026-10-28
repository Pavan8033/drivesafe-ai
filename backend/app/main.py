"""Main FastAPI application entry point for DriveSafe AI Telemetry Engine."""

import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .services import FaceLandmarksService
from .api import health_router, monitoring_router

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("drivesafe.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager to initialize models at startup and clean up at shutdown."""
    logger.info("Initializing DriveSafe AI Services...")
    # Initialize the FaceLandmarker model
    landmark_service = FaceLandmarksService(model_path=settings.MODEL_PATH)
    app.state.landmark_service = landmark_service
    if landmark_service.is_ready:
        logger.info("MediaPipe FaceLandmarker is READY for telemetry analysis.")
    else:
        logger.warning(
            "FaceLandmarker model could not be loaded at startup. Health is DEGRADED."
        )

    yield

    logger.info("Shutting down DriveSafe AI Services...")
    if landmark_service:
        landmark_service.close()


app = FastAPI(
    title="DriveSafe AI Telemetry Engine",
    description="Real-time facial landmark analysis, EAR telemetry, and driver drowsiness detection.",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(health_router, prefix="/api", tags=["health"])
app.include_router(monitoring_router, prefix="/api", tags=["monitoring"])
app.include_router(monitoring_router, tags=["websocket"])


@app.get("/")
def root():
    """Root metadata endpoint."""
    return {
        "service": "DriveSafe AI Telemetry Engine",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "endpoints": {
            "health": "/api/health",
            "monitoring_config": "/api/monitoring/config",
            "websocket_monitor": "/ws/monitor",
        },
    }
