"use server";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImageToCloudinary(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, message: "لم يتم اختيار أي ملف" };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new Promise<{ success: boolean; url?: string; message?: string }>((resolve) => {
      cloudinary.uploader.upload_stream(
        {
          folder: "biozad-ecosystem",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            resolve({ success: false, message: error.message });
          } else {
            resolve({ success: true, url: result?.secure_url });
          }
        }
      ).end(buffer);
    });
  } catch (error: any) {
    console.error("Cloudinary action error:", error);
    return { success: false, message: error.message || "حدث خطأ غير معروف", url: undefined };
  }
}
