from fastapi import HTTPException


class FileTooLargeError(HTTPException):
    def __init__(self):
        super().__init__(status_code=413, detail="File too large. Maximum size is 10MB.")


class InvalidFormatError(HTTPException):
    def __init__(self):
        super().__init__(status_code=400, detail="Invalid file format. Only JPG and PNG are supported.")


class ProcessingError(HTTPException):
    def __init__(self, detail: str = "Failed to process image"):
        super().__init__(status_code=500, detail=detail)


DEFAULT_RECOMMENDED_SETTINGS = {
    "resolution": 32,
    "height_multiplier": 1.5,
    "color_mode": "rgb",
    "is_complex_logo": False,
}
