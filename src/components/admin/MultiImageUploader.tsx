"use client";

import React, { useState } from "react";
import { uploadImageToCloudinary } from "@/app/actions/upload";
import { useToastStore } from "@/store/useToastStore";
import { 
  Plus, Trash2, Star, Image as ImageIcon, UploadCloud, 
  ArrowRight, ArrowLeft, Link as LinkIcon, Loader2 
} from "lucide-react";

interface MultiImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
  description?: string;
  maxImages?: number;
}

export function MultiImageUploader({
  images,
  onChange,
  label = "صور العرض",
  description = "يمكنك رفع عدة صور أو إضافتها برابط مباشر. الصورة الأولى هي الصورة الرئيسية.",
  maxImages = 10,
}: MultiImageUploaderProps) {
  const { showToast } = useToastStore();
  const [uploading, setUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // رفع ملفات متعددة دفعة واحدة
  const handleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      showToast(`الحد الأقصى المسموح به هو ${maxImages} صور`, "error");
      return;
    }

    setUploading(true);
    setUploadCount(files.length);

    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append("file", file);

        const res = await uploadImageToCloudinary(fd);
        if (res.success && res.url) {
          newUrls.push(res.url);
        } else {
          showToast(res.message || `فشل رفع الصورة ${file.name}`, "error");
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
        showToast(`✓ تم رفع ${newUrls.length} صور بنجاح!`, "success");
      }
    } catch (err: any) {
      showToast("حدث خطأ أثناء الرفع", "error");
    } finally {
      setUploading(false);
      setUploadCount(0);
      e.target.value = "";
    }
  };

  // إضافة صورة عبر رابط URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (images.includes(trimmed)) {
      showToast("هذه الصورة مضافة مسبقاً", "error");
      return;
    }

    onChange([...images, trimmed]);
    setUrlInput("");
    setShowUrlInput(false);
    showToast("✓ تم إضافة رابط الصورة!", "success");
  };

  // حذف صورة معينة
  const handleRemoveImage = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  // تعيين صورة كرئيسية (نقلها للبداية)
  const handleSetPrimary = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const filtered = images.filter((_, idx) => idx !== index);
    onChange([target, ...filtered]);
    showToast("✓ تم تعيينها كصورة رئيسية!", "success");
  };

  // تحريك ترتيب الصور
  const handleMove = (index: number, direction: "prev" | "next") => {
    const newIdx = direction === "prev" ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[newIdx];
    copy[newIdx] = temp;
    onChange(copy);
  };

  return (
    <div className="space-y-3">
      
      {/* الرأس والتعليمات */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
            <ImageIcon className="h-4 w-4 text-emerald-600" />
            <span>{label} ({images.length} صور)</span>
          </label>
          <p className="text-[11px] text-neutral-400 mt-0.5">{description}</p>
        </div>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-neutral-500 hover:text-emerald-700 self-start sm:self-auto flex items-center gap-1"
        >
          <LinkIcon className="h-3 w-3" />
          <span>{showUrlInput ? "إلغاء إضافة رابط" : "+ إضافة برابط صورة مباشر"}</span>
        </button>
      </div>

      {/* حقل إدخال الرابط إن طلبه المستخدم */}
      {showUrlInput && (
        <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://... الصق رابط الصورة المباشر هنا"
            className="flex-1 border rounded-lg p-2 text-xs font-mono bg-white dark:bg-neutral-900"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold shrink-0 hover:bg-emerald-800"
          >
            إضافة الرابط
          </button>
        </div>
      )}

      {/* معرض الصور المضافة مع المعاينة الحية */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((img, idx) => {
          const isPrimary = idx === 0;

          return (
            <div
              key={idx}
              className={`relative group rounded-2xl border overflow-hidden aspect-square bg-neutral-100 dark:bg-neutral-800 transition-all ${
                isPrimary
                  ? "border-emerald-500 ring-2 ring-emerald-500/30 shadow-md"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
              }`}
            >
              <img
                src={img}
                alt={`صورة ${idx + 1}`}
                className="w-full h-full object-cover"
              />

              {/* شارة الصورة الرئيسية */}
              {isPrimary && (
                <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1 z-10">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  <span>الرئيسية</span>
                </span>
              )}

              {/* زر حذف سريع دائماً في الركن الأيسر */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveImage(idx);
                }}
                className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center transition-all z-10 opacity-75 group-hover:opacity-100 shadow-sm"
                title="حذف هذه الصورة"
              >
                <Trash2 className="h-3 w-3" />
              </button>

              {/* أزرار التحكم على الصورة (تظهر عند الوقوف بالماوس أو على الهاتف) */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/80 font-mono">#{idx + 1}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="p-1 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-sm"
                    title="حذف هذه الصورة"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="space-y-1">
                  {!isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="w-full py-1 rounded-md bg-white/90 hover:bg-white text-neutral-900 text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
                    >
                      <Star className="h-3 w-3 text-amber-500 fill-current" />
                      <span>تعيين كرئيسية</span>
                    </button>
                  )}

                  {/* أزرار تغيير الترتيب */}
                  <div className="flex items-center justify-center gap-1 text-white">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "prev")}
                        className="p-1 bg-white/20 hover:bg-white/40 rounded text-[9px]"
                        title="تحريك للخلف"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                    {idx < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMove(idx, "next")}
                        className="p-1 bg-white/20 hover:bg-white/40 rounded text-[9px]"
                        title="تحريك للأمام"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}

        {/* كرت رفع الصور الجديد */}
        {images.length < maxImages && (
          <label className="relative flex flex-col items-center justify-center aspect-square border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 hover:bg-emerald-50/30 transition-all cursor-pointer p-3 text-center group">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleFilesUpload}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            {uploading ? (
              <div className="space-y-1.5 flex flex-col items-center">
                <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
                <span className="text-[10px] font-bold text-emerald-700">
                  جاري رفع {uploadCount} صور...
                </span>
              </div>
            ) : (
              <div className="space-y-1 flex flex-col items-center">
                <div className="h-8 w-8 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UploadCloud className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300">
                  + إضافة صور
                </span>
                <span className="text-[9px] text-neutral-400">
                  يمكنك تحديد عدة صور معاً
                </span>
              </div>
            )}
          </label>
        )}
      </div>

    </div>
  );
}
