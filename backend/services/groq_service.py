import json
import base64
from io import BytesIO
from groq import Groq
from PIL import Image
from utils.errors import DEFAULT_RECOMMENDED_SETTINGS
import config


def analyze_logo(image: Image.Image) -> dict:
    if not config.GROQ_API_KEY:
        return dict(DEFAULT_RECOMMENDED_SETTINGS)

    try:
        client = Groq(api_key=config.GROQ_API_KEY)

        buffered = BytesIO()
        image_rgb = image.convert("RGB")
        image_rgb.save(buffered, format="JPEG", quality=85)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()

        w, h = image.size
        prompt = (
            f"Analyze this logo image ({w}x{h}px). "
            "Return ONLY valid JSON with keys:\n"
            '- "is_complex": boolean (many small details?)\n'
            '- "recommended_resolution": 16|32|48|64\n'
            '- "recommended_height": number 0.5-2.5\n'
            '- "color_mode": "rgb"|"grayscale"\n'
            "No preamble, no markdown."
        )

        response = client.chat.completions.create(
            model="llama-3.2-11b-vision-preview",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{img_base64}"
                            },
                        },
                    ],
                }
            ],
            temperature=0.1,
            max_tokens=256,
        )

        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.strip("`").strip()
            if raw.startswith("json"):
                raw = raw[4:].strip()

        parsed = json.loads(raw)
        return {
            "is_complex": parsed.get("is_complex", False),
            "resolution": parsed.get("recommended_resolution", 32),
            "height_multiplier": parsed.get("recommended_height", 1.5),
            "color_mode": parsed.get("color_mode", "rgb"),
        }

    except Exception:
        return dict(DEFAULT_RECOMMENDED_SETTINGS)
