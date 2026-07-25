from PIL import Image


def remove_background(image: Image.Image, try_rembg: bool = True) -> Image.Image:
    if image.mode == "RGBA":
        alpha = image.split()[3]
        if alpha.getextrema()[0] < 255:
            return image

    if try_rembg:
        try:
            from rembg import remove

            result = remove(image)
            if result.mode != "RGBA":
                result = result.convert("RGBA")
            return result
        except Exception:
            pass

    return image.convert("RGBA")
