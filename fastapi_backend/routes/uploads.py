from fastapi import APIRouter, File, UploadFile, HTTPException
from config import settings
import os
import uuid
from pathlib import Path

router = APIRouter(prefix="/api/v2", tags=["uploads"])

ALLOWED_EXTENSIONS = {"pdf", "jpg", "png", "jpeg"}

def allowed_file(filename: str) -> bool:
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        if not allowed_file(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
            )

        if file.size and file.size > settings.max_file_size:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum limit of {settings.max_file_size / 1024 / 1024:.2f}MB"
            )

        os.makedirs(settings.upload_folder, exist_ok=True)

        file_extension = file.filename.rsplit(".", 1)[1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(settings.upload_folder, unique_filename)

        contents = await file.read()
        with open(file_path, "wb") as f:
            f.write(contents)

        return {
            "success": True,
            "filename": unique_filename,
            "original_name": file.filename,
            "message": "File uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
