import { env } from "@nanobanana-pro/env/server";

interface ImgbbResponse {
  data: {
    id: string;
    title: string;
    url_viewer: string;
    url: string;
    display_url: string;
    width: string;
    height: string;
    size: string;
    time: string;
    expiration: string;
    image: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    thumb: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    medium?: {
      filename: string;
      name: string;
      mime: string;
      extension: string;
      url: string;
    };
    delete_url: string;
  };
  success: boolean;
  status: number;
}

/**
 * Upload a base64 image to imgbb and return the public URL.
 * Together AI requires public HTTP URLs for image_url parameter.
 */
export async function uploadToImgbb(base64Image: string): Promise<string> {
  // Remove data URI prefix if present (e.g., "data:image/png;base64,")
  const base64Data = base64Image.includes(",")
    ? base64Image.split(",")[1]
    : base64Image;

  const formData = new FormData();
  formData.append("key", env.IMGBB_API_KEY);
  formData.append("image", base64Data);

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`imgbb upload failed: ${response.statusText}`);
  }

  const result: ImgbbResponse = await response.json();

  if (!result.success) {
    throw new Error("imgbb upload failed: API returned unsuccessful status");
  }

  return result.data.url;
}
