/** Loads an image from a File or URL and downscales it (preserving aspect
 * ratio, never cropping) so its longest side is at most `maxDimension`.
 * Returns a JPEG Blob. If the image is already smaller, it's re-encoded
 * as-is (no upscaling). */
export async function resizeImagePreserveAspect(
  source: File | string,
  maxDimension = 1600
): Promise<Blob> {
  const img = await loadImage(source);

  const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");

  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("failed to encode image"))),
      "image/jpeg",
      0.9
    );
  });
}

/** Loads an image from a File or URL, center-crops it to a square, and
 * resizes it to `size`x`size`, returning a JPEG Blob. Used for avatars only —
 * banners/thumbnails/screenshots should keep their original aspect ratio,
 * see `resizeImagePreserveAspect` above. */
export async function cropAndResizeImage(source: File | string, size = 512): Promise<Blob> {
  const img = await loadImage(source);

  const minSide = Math.min(img.width, img.height);
  const sx = (img.width - minSide) / 2;
  const sy = (img.height - minSide) / 2;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas not supported");

  ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("failed to encode image"))),
      "image/jpeg",
      0.9
    );
  });
}

function loadImage(source: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (typeof source !== "string") {
      img.src = URL.createObjectURL(source);
    } else {
      img.crossOrigin = "anonymous";
      img.src = source;
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("failed to load image"));
  });
}
