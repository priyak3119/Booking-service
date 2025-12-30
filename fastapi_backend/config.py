from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Database
    database_url: str

    # Mastercard / Magniti sandbox credentials
    magniti_merchant_id: str = "804014000"
    magniti_operator_id: str = "merchant.804014000"
    magniti_password: str = "56e7281fda84682d652ce01d9d6e4ae4"
    magniti_api_version: str = "65"

    # File uploads
    upload_folder: str = "./uploads"
    max_file_size: int = 5 * 1024 * 1024  # 5 MB
    allowed_file_types: List[str] = ["pdf", "jpg", "png", "jpeg"]

    # SMTP / Email configuration
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = "priyabridgingfx@gmail.com"
    smtp_password: str = "tcrmxiotpmzubwqo"
    smtp_from_email: str = "FBMA <priyabridgingfx@gmail.com>"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

# Create global settings instance
settings = Settings()
