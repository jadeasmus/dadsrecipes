"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onRecipeParsed?: (recipeData: any) => void;
  currentImageUrl?: string;
}

interface SelectedPhoto {
  id: string;
  file: File;
  preview: string;
}

const MAX_PHOTOS = 5;

export function ImageUpload({
  onImageUploaded,
  onRecipeParsed,
  currentImageUrl,
}: ImageUploadProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files) return;

    const newPhotos: SelectedPhoto[] = [];
    const remainingSlots = MAX_PHOTOS - selectedPhotos.length;

    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (file.type.startsWith("image/")) {
          newPhotos.push({
            id: `${Date.now()}-${Math.random()}`,
            file,
            preview: URL.createObjectURL(file),
          });
        }
      });

    if (newPhotos.length === 0) {
      setError("Please select valid image files");
      return;
    }

    if (selectedPhotos.length + newPhotos.length > MAX_PHOTOS) {
      setError(`Maximum ${MAX_PHOTOS} photos allowed`);
    }

    const updatedPhotos = [...selectedPhotos, ...newPhotos];
    setSelectedPhotos(updatedPhotos);
    setError(null);

    // Reset input values to allow selecting the same file again
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (albumInputRef.current) albumInputRef.current.value = "";

    // If onRecipeParsed is not provided, upload immediately (for optional recipe image)
    if (!onRecipeParsed && updatedPhotos.length > 0) {
      await uploadSingleImage(updatedPhotos[0]);
    }
  };

  const uploadSingleImage = async (photo: SelectedPhoto) => {
    setError(null);
    setIsUploading(true);

    try {
      const supabase = createClient();
      const fileExt = photo.file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `recipe-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("recipe-images")
        .upload(filePath, photo.file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("recipe-images").getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      // Clear selection after upload
      setSelectedPhotos([]);
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCameraSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const handleAlbumSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  };

  const removePhoto = (id: string) => {
    setSelectedPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) {
        URL.revokeObjectURL(photo.preview);
      }
      return prev.filter((p) => p.id !== id);
    });
    setError(null);
  };

  const handleSubmit = async () => {
    if (selectedPhotos.length === 0) return;
    if (!onRecipeParsed) return;

    setError(null);
    setIsUploading(true);
    setIsParsing(true);

    try {
      const supabase = createClient();
      const uploadedUrls: string[] = [];
      const formData = new FormData();

      // Upload all photos to Supabase
      for (const photo of selectedPhotos) {
        const fileExt = photo.file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `recipe-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(filePath, photo.file);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-images").getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
        formData.append("image", photo.file);
      }

      // Use first uploaded image URL for the recipe
      const primaryImageUrl = uploadedUrls[0];
      onImageUploaded(primaryImageUrl);

      // Parse all images
      const response = await fetch("/api/parse-recipe-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to parse recipe from images");
      }

      const recipeData = await response.json();
      onRecipeParsed({
        ...recipeData,
        image_url: primaryImageUrl,
      });
    } catch (err) {
      console.error("Error processing images:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process images. Please try again."
      );
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      selectedPhotos.forEach((photo) => {
        URL.revokeObjectURL(photo.preview);
      });
    };
  }, [selectedPhotos]);

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Photo Selection Buttons */}
      {selectedPhotos.length < MAX_PHOTOS &&
        (!onRecipeParsed || selectedPhotos.length === 0) && (
          <div className="flex items-center gap-3">
            <span className="relative z-0 inline-flex before:pointer-events-none before:absolute before:inset-0 before:z-0 before:translate-x-1.5 before:translate-y-1.5 before:bg-black/35 before:content-['']">
              <label
                className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-none border-2 border-black bg-white px-6 py-3 text-base font-semibold text-black transition-transform active:translate-x-1 active:translate-y-1 ${
                  isUploading || isParsing
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Take Photo
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraSelect}
                  className="hidden"
                  disabled={isUploading || isParsing}
                />
              </label>
            </span>

            <span className="relative z-0 inline-flex before:pointer-events-none before:absolute before:inset-0 before:z-0 before:translate-x-1.5 before:translate-y-1.5 before:bg-black/35 before:content-['']">
              <label
                className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-none border-2 border-black bg-white px-6 py-3 text-base font-semibold text-black transition-transform active:translate-x-1 active:translate-y-1 ${
                  isUploading || isParsing
                    ? "cursor-not-allowed opacity-60"
                    : "cursor-pointer"
                }`}
              >
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Choose from Album
                <input
                  ref={albumInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleAlbumSelect}
                  className="hidden"
                  disabled={isUploading || isParsing}
                />
              </label>
            </span>
          </div>
        )}

      {/* Selected Photos Preview Grid */}
      {selectedPhotos.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {selectedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={photo.preview}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(photo.id)}
                  disabled={isUploading || isParsing}
                  className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-white transition-opacity hover:opacity-80 disabled:opacity-50"
                  aria-label="Remove photo"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {selectedPhotos.length < MAX_PHOTOS && (
            <p className="text-xs text-muted-foreground">
              {selectedPhotos.length} of {MAX_PHOTOS} photos selected
            </p>
          )}
        </div>
      )}

      {/* Submit Button */}
      {selectedPhotos.length > 0 && onRecipeParsed && (
        <div className="flex items-center gap-3">
          <span className="relative z-0 inline-flex before:pointer-events-none before:absolute before:inset-0 before:z-0 before:translate-x-1.5 before:translate-y-1.5 before:bg-black/35 before:content-['']">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isUploading || isParsing}
              className="relative z-10 inline-flex items-center justify-center gap-2 rounded-none border-2 border-black bg-white px-8 py-3 text-base font-semibold text-black transition-transform active:translate-x-1 active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isParsing ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Parsing Recipe...
                </>
              ) : isUploading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Submit for Parsing
                </>
              )}
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
