"""
Application configuration.
All settings are read from environment variables with sensible defaults.
"""

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Central configuration consumed by the FastAPI app."""

    app_name: str = "Gestalt Engine"
    app_version: str = "2.0.0"
    debug: bool = False

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # Model
    model_confidence_threshold: float = Field(
        default=0.95, ge=0.0, le=1.0, description="Minimum confidence to report a gesture"
    )

    # WebSocket
    ws_max_connections: int = 50

    class Config:
        env_prefix = "GESTALT_"
        env_file = ".env"


settings = Settings()
