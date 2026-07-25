from io import BytesIO
from PIL import Image
from utils.errors import InvalidFormatError, FileTooLargeError
import config

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/jpg"}


def validate_and_load(file_bytes: bytes, content_type: str) -> Image.Image:
    if content_type not in ALLOWED_TYPES:
        raise InvalidFormatError()

    if len(file_bytes) > config.MAX_FILE_SIZE:
        raise FileTooLargeError()

    img = Image.open(BytesIO(file_bytes))
    img = img.convert("RGBA")
    return img
