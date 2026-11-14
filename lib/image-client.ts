"use client";

/**
 * Downscales and re-encodes an image in the browser so uploads stay small
 * (and EXIF metadata such as GPS position or camera model is stripped,
 * because a canvas export never carries it over).
 */
export async function prepareImage(
  file: File,
  maxDimension = 1600,
  quality = 0.82,
): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > 20 * 1024 * 1024) throw new Error("That image is larger than 20 MB.");

  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("This image format is not supported. Try a JPEG or PNG.");
  });

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Could not process the image in this browser.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
