from fastapi import APIRouter
from app.models.schemas import ApiResponse, InferenceConfig
from app.services.neural import neural_service
from config import settings

router = APIRouter(tags=["model"])


@router.post("/model/reload", response_model=ApiResponse)
async def reload_model():
    """Hot-reload the gesture model."""
    try:
        neural_service.unload_model()
        neural_service.load_model()
        return ApiResponse(success=True, data={"ok": True})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))


@router.put("/config", response_model=ApiResponse)
async def update_config(config: InferenceConfig):
    """Update inference parameters at runtime."""
    if config.confidence_threshold is not None:
        settings.model_confidence_threshold = config.confidence_threshold
    return ApiResponse(success=True, data={"ok": True})
