"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Input } from "./Input";
import { Sparkles, Check, Upload, Loader2, Link2 } from "lucide-react";
import { resolveImageUrl } from "@/lib/media";
import { api, getErrorMessage } from "@/services/api";

export interface ImagePickerResult {
  mediaId: number | null;
  url: string;
}

export interface ImagePickerProps {
  label?: string;
  value: string;
  onChange: (result: ImagePickerResult) => void;
  error?: string;
}

const foodPresets = [
  {
    name: "Chicken Karahi",
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Karahi",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Chicken Mince Karahi",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Mince Karahi",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Boneless Chicken Karahi",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Chops Karahi",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Mutton Chops with Mince",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Desi Murgh Karahi",
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Muscles (Machli)",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
];

async function compressImageClient(
  file: File
): Promise<{ blob: Blob; filename: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Failed to decode image file."));
      img.onload = () => {
        const MAX_DIM = 1600;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          return reject(new Error("Canvas context is unavailable."));
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const baseName = file.name.replace(/\.[^/.]+$/, "");
              resolve({ blob, filename: `${baseName}.webp` });
            } else {
              // Fallback to JPEG
              canvas.toBlob(
                (jpegBlob) => {
                  if (jpegBlob) {
                    const baseName = file.name.replace(/\.[^/.]+$/, "");
                    resolve({ blob: jpegBlob, filename: `${baseName}.jpg` });
                  } else {
                    reject(new Error("Canvas failed to compress image."));
                  }
                },
                "image/jpeg",
                0.82
              );
            }
          },
          "image/webp",
          0.82
        );
      };
      img.src = String(e.target?.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ImagePicker({
  label = "Dish Image",
  value,
  onChange,
  error,
}: ImagePickerProps) {
  const [showPresets, setShowPresets] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so same file can be chosen again if needed
    e.target.value = "";

    setIsUploading(true);
    setUploadError(null);

    try {
      const { blob, filename } = await compressImageClient(file);
      const res = await api.uploadMedia(blob, filename);
      onChange({ mediaId: res.id, url: res.url });
    } catch (err: unknown) {
      setUploadError(getErrorMessage(err, "Failed to upload image."));
    } finally {
      setIsUploading(false);
    }
  };

  const resolvedUrl = resolveImageUrl(value);
  const isCustomMedia = value.includes("/api/media/");

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[11px] font-bold text-charcoal-600 hover:text-charcoal-900 flex items-center gap-1 cursor-pointer"
          >
            <Link2 className="w-3 h-3" />
            <span>{showUrlInput ? "Hide URL" : "Enter URL"}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="text-[11px] font-bold text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>{showPresets ? "Hide Presets" : "Desi Presets"}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-3 items-center">
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-sand-200 border-2 border-sand-300 shrink-0 shadow-sm flex items-center justify-center">
          {value ? (
            <Image
              src={resolvedUrl}
              alt="Preview"
              fill
              unoptimized={isCustomMedia}
              sizes="64px"
              className="object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-[10px] font-bold text-charcoal-700/60">
              No Img
            </span>
          )}
        </div>

        {/* Upload Button + Status */}
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="flex gap-2 items-center">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              type="button"
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-charcoal-900 text-sand-100 hover:bg-charcoal-800 text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-sand-300" />
                  <span>Compressing & Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5 text-sand-300" />
                  <span>Upload Image (Max 2MB)</span>
                </>
              )}
            </button>

            {value && (
              <span className="text-[11px] text-charcoal-500 truncate max-w-[200px]">
                {isCustomMedia ? "Stored in Database" : value}
              </span>
            )}
          </div>

          {(uploadError || error) && (
            <p className="text-[11px] font-semibold text-red-500">
              {uploadError || error}
            </p>
          )}
        </div>
      </div>

      {/* Optional Direct URL Input */}
      {showUrlInput && (
        <div className="pt-1">
          <Input
            value={value}
            onChange={(e) => onChange({ mediaId: null, url: e.target.value })}
            placeholder="https://images.unsplash.com/... or paste image URL"
            error={error}
          />
        </div>
      )}

      {/* Preset Gallery */}
      {showPresets && (
        <div className="p-3 bg-sand-100 border border-sand-300 rounded-2xl space-y-2 animate-in fade-in duration-150">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/80">
            Quick Select Desi HD Dish Photos:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {foodPresets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    onChange({ mediaId: null, url: preset.url });
                    setShowPresets(false);
                  }}
                  className={`group relative h-16 rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-terracotta-500 shadow-md ring-2 ring-terracotta-500/30"
                      : "border-sand-300 hover:border-charcoal-900"
                  }`}
                >
                  <Image
                    src={preset.url}
                    alt={preset.name}
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[9px] font-bold text-white truncate">
                      {preset.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
