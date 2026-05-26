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
            type=m,
            active=neural_service.is_loaded(m),
            latency=neural_service.get_latency(m),
            fidelity=neural_service.get_fidelity(m),
        )
        for m in neural_service.all_modalities
    ]

    status = SystemStatus(
        modalities=modalities,
        uptime=time.time() - _start_time,
        version=settings.app_version,
        model_loaded=neural_service.model_loaded,
    )

    return ApiResponse(success=True, data=status.model_dump())
