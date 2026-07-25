import time
import base64
from io import BytesIO
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form
from PIL import Image
from services.image_processor import validate_and_load
from services.groq_service import analyze_logo
from services.background_remover import remove_background
from services.voxel_generator import generate_voxel_grids, get_dominant_colors
import config

router = APIRouter()

_SAMPLES_CACHE = None


def _load_samples():
    global _SAMPLES_CACHE
    if _SAMPLES_CACHE is not None:
        return _SAMPLES_CACHE

    samples_dir = Path(__file__).resolve().parent.parent / "samples"
    samples = []

    sample_files = [
        ("nike.png", "Nike Logo"),
    ]

    for filename, name in sample_files:
        path = samples_dir / filename
        if not path.exists():
            continue

        try:
            with open(path, "rb") as f:
                content = f.read()

            img = validate_and_load(content, "image/png")
            img_no_bg = remove_background(img)
            voxels = generate_voxel_grids(img_no_bg)

            buffered = BytesIO()
            thumb = img.copy()
            thumb.thumbnail((128, 128))
            thumb.save(buffered, format="PNG")
            img_b64 = base64.b64encode(buffered.getvalue()).decode()

            samples.append({
                "id": f"sample_{filename}",
                "name": name,
                "imageUrl": f"data:image/png;base64,{img_b64}",
                "voxels": voxels,
            })
        except Exception as e:
            print(f"Failed to load sample {filename}: {e}")
            continue

    _SAMPLES_CACHE = samples
    return samples


@router.post("/api/convert")
async def convert_logo(
    file: UploadFile = File(...),
    remove_bg: bool = Form(default=True),
    height_multiplier: float = Form(default=1.5),
):
    start = time.time()
    content = await file.read()
    img = validate_and_load(content, file.content_type or "image/png")

    groq_config = analyze_logo(img)

    if remove_bg:
        img = remove_background(img)

    dominant = get_dominant_colors(img)
    voxel_data = generate_voxel_grids(img, height_multiplier)

    elapsed = int((time.time() - start) * 1000)

    return {
        "status": "success",
        "voxels": voxel_data,
        "metadata": {
            "original_size": {"width": img.width, "height": img.height},
            "has_alpha": img.mode == "RGBA",
            "dominant_colors": dominant,
            "processing_time_ms": elapsed,
        },
        "recommended_settings": groq_config,
    }


@router.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "groq_available": bool(config.GROQ_API_KEY),
    }


@router.get("/api/samples")
async def get_samples():
    return {"status": "success", "samples": _load_samples()}
