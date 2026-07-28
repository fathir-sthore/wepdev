/** Loads an image from a File or URL, center-crops it to a square, and
 * resizes it to `size`x`size`, returning a JPEG Blob. */
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
