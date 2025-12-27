from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    database_url: str
    magniti_merchant_id: str
    magniti_operator_id: str
    magniti_password: str
    magniti_api_version: str = "70"
    upload_folder: str = "./uploads"
    max_file_size: int = 5242880
    allowed_file_types: list = ["pdf", "jpg", "png", "jpeg"]

    class Config:
        env_file = ".env"

settings = Settings()



