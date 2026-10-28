"""Health API Router."""

from fastapi import APIRouter, Request
from ..schemas import HealthStatus

router = APIRouter()


@router.get("/health", response_model=HealthStatus)
async def health_check(request: Request):
    """Health check reporting backend state and landmark model availability."""
    landmark_service = getattr(request.app.state, "landmark_service", None)
    model_loaded = landmark_service.is_ready if landmark_service else False

    return HealthStatus(
        status="HEALTHY" if model_loaded else "DEGRADED",
        version="1.0.0",
        model_loaded=model_loaded,
        service="DriveSafe AI Telemetry Engine",
    )
