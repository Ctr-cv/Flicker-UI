import time
from fastapi import APIRouter
from app.models.schemas import ApiResponse, SystemStatus, ModalityStatus
from app.services.neural import neural_service
from config import settings

router = APIRouter(tags=["status"])

_start_time = time.time()


@router.get("/status", response_model=ApiResponse)
async def get_status():
    modalities = [
        ModalityStatus(
            type="gesture",
            active=neural_service.is_loaded("gesture"),
            latency=neural_service.get_latency("gesture"),
            fidelity=neural_service.get_fidelity("gesture"),
        ),
        ModalityStatus(
            type="speech",
            active=neural_service.is_loaded("speech"),
            latency=neural_service.get_latency("speech"),
            fidelity=neural_service.get_fidelity("speech"),
        ),
        ModalityStatus(type="haptics", active=False, latency=0.0, fidelity=0.0),
        ModalityStatus(type="audio", active=False, latency=0.0, fidelity=0.0),
    ]

    status = SystemStatus(
        modalities=modalities,
        uptime=time.time() - _start_time,
        version=settings.app_version,
        model_loaded=neural_service.model_loaded,
    )

    return ApiResponse(success=True, data=status.model_dump())
