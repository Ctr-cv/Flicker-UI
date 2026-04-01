from fastapi import APIRouter
from app.models.schemas import HealthResponse, ApiResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=ApiResponse)
async def health_check():
    return ApiResponse(success=True, data=HealthResponse().model_dump())
