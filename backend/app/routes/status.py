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
            active=neural_service.model_loaded,
            latency=neural_service.last_latency,
            fidelity=neural_service.last_fidelity,
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
