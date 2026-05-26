from fastapi import APIRouter, Query
from app.models.schemas import ApiResponse, InferenceConfig
from app.services.neural import neural_service
from config import settings

router = APIRouter(tags=["model"])


@router.post("/model/reload", response_model=ApiResponse)
async def reload_model(modality: str = Query(default="gesture")):
    """Hot-reload a modality engine. Defaults to 'gesture'."""
    try:
        if modality not in neural_service.all_modalities:
            return ApiResponse(
                success=False,
                error=f"Modality '{modality}' is not registered. Available: {neural_service.all_modalities}",
            )
        neural_service.unload_engine(modality)
        neural_service.load_engine(modality)
        return ApiResponse(success=True, data={"modality": modality, "ok": True})
    except Exception as e:
        return ApiResponse(success=False, error=str(e))


@router.put("/config", response_model=ApiResponse)
async def update_config(config: InferenceConfig):
    """Update inference parameters at runtime."""
    updated: list[str] = []
    if config.confidence_threshold is not None:
        settings.model_confidence_threshold = config.confidence_threshold
        updated.append("model_confidence_threshold")
    if config.speech_confidence_threshold is not None:
        settings.speech_confidence_threshold = config.speech_confidence_threshold
        updated.append("speech_confidence_threshold")
    return ApiResponse(success=True, data={"updated": updated})
