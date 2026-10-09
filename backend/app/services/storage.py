import os
import shutil
import uuid
from abc import ABC, abstractmethod

UPLOAD_DIR = os.getenv("UPLOAD_DIR", os.path.join(os.getcwd(), "uploaded_documents"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

class StorageService(ABC):
    @abstractmethod
    def save_file(self, file_content: bytes, original_filename: str) -> str:
        """Saves file and returns file storage path/reference."""
        pass

    @abstractmethod
    def get_file(self, storage_path: str) -> bytes:
        """Retrieves raw bytes from storage."""
        pass

    @abstractmethod
    def delete_file(self, storage_path: str) -> bool:
        """Deletes file from storage."""
        pass

class LocalStorageService(StorageService):
    def __init__(self, base_dir: str = UPLOAD_DIR):
        self.base_dir = base_dir
        os.makedirs(self.base_dir, exist_ok=True)

    def save_file(self, file_content: bytes, original_filename: str) -> str:
        ext = os.path.splitext(original_filename)[1]
        unique_filename = f"{uuid.uuid4().hex}{ext}"
        file_path = os.path.join(self.base_dir, unique_filename)
        with open(file_path, "wb") as f:
            f.write(file_content)
        return file_path

    def get_file(self, storage_path: str) -> bytes:
        if not os.path.exists(storage_path):
            raise FileNotFoundError(f"File not found at {storage_path}")
        with open(storage_path, "rb") as f:
            return f.read()

    def delete_file(self, storage_path: str) -> bool:
        if os.path.exists(storage_path):
            os.remove(storage_path)
            return True
        return False

def get_storage_service() -> StorageService:
    return LocalStorageService()
