"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploadProps {
  onImageUploaded: (imageUrl: string) => void;
  onRecipeParsed?: (recipeData: any) => void;
  currentImageUrl?: string;
}

const TEST_IMAGES = [
  { name: "handwritten.jpg", label: "Handwritten Recipe" },
  { name: "handwritten_2.jpg", label: "Handwritten Recipe 2" },
  { name: "handwritten_3.jpg", label: "Handwritten Recipe 3" },
  { name: "handwritten_bad_lighting.jpg", label: "Handwritten (Bad Lighting)" },
  { name: "blueberry_muffins.jpg", label: "Blueberry Muffins" },
  { name: "carrot_cake.jpg", label: "Carrot Cake" },
  { name: "minimal_notes.jpg", label: "Minimal Notes" },
  { name: "multi_recipes.jpg", label: "Multiple Recipes" },
  { name: "not_a_recipe.jpg", label: "Not a Recipe" },
  { name: "bad_quality_corrections.jpg", label: "Bad Quality Corrections" },
  { name: "tinymargins.jpg", label: "Tiny Margins" },
];

const isDevMode = process.env.NODE_ENV === "development";

export function ImageUpload({
  onImageUploaded,
  onRecipeParsed,
  currentImageUrl,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null
  );

  const processImageFile = async (
    file: File,
    skipUpload: boolean = false,
    localPath: string | null = null
  ) => {
    setError(null);
    // For test images with local paths, use the local path for preview
    // Otherwise, use blob URL for regular uploads
    setPreviewUrl(localPath || URL.createObjectURL(file));

    let uploadedImageUrl: string | null = null;

    // Upload to Supabase Storage (skip for test images)
    if (!skipUpload) {
      setIsUploading(true);
      try {
        const supabase = createClient();

        // Generate unique filename
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `recipe-images/${fileName}`;

        // Upload file
        const { error: uploadError } = await supabase.storage
          .from("recipe-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("recipe-images").getPublicUrl(filePath);

        uploadedImageUrl = publicUrl;
        onImageUploaded(publicUrl);
      } catch (err) {
        console.error("Error uploading image:", err);
        setError("Failed to upload image");
        setPreviewUrl(null);
        setIsUploading(false);
        return;
      } finally {
        setIsUploading(false);
      }
    } else if (localPath) {
      // For test images, use the local path and notify parent
      uploadedImageUrl = localPath;
      onImageUploaded(localPath);
    }

    // If onRecipeParsed is provided, try to parse the recipe from the image
    // For test images, we can parse directly without requiring an uploaded URL
    if (onRecipeParsed) {
      setIsParsing(true);
      try {
        const formData = new FormData();
        formData.append("image", file);

        const response = await fetch("/api/parse-recipe-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to parse recipe from image");
        }

        const recipeData = await response.json();
        // Include the image URL in the parsed recipe data (local path for test images, uploaded URL for regular uploads)
        onRecipeParsed({
          ...recipeData,
          image_url: uploadedImageUrl,
        });
      } catch (err) {
        console.error("Error parsing recipe from image:", err);
        setError(
          skipUpload
            ? "Failed to parse recipe from image"
            : "Failed to parse recipe from image. Image uploaded successfully."
        );
      } finally {
        setIsParsing(false);
      }
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const handleTestImageSelect = async (imageName: string) => {
    if (!isDevMode) return;

    try {
      // Fetch the test image
      const response = await fetch(`/test_recipes/${imageName}`);
      if (!response.ok) throw new Error("Failed to fetch test image");

      const blob = await response.blob();

      // Convert blob to File object
      const file = new File([blob], imageName, { type: blob.type });

      // Local path for test images (files in public/test_recipes/ are served at /test_recipes/)
      const localPath = `/test_recipes/${imageName}`;

      // Process it directly (skip Supabase upload, send directly to API, use local path)
      await processImageFile(file, true, localPath);
    } catch (err) {
      console.error("Error loading test image:", err);
      setError("Failed to load test image");
    }
  };

  return (
    <div className="space-y-3">
      {previewUrl && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <img
            src={previewUrl}
            alt="Preview"
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {isDevMode && (
          <div className="rounded-lg border-2 border-dashed border-amber-300 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-900/20">
            <label className="mb-2 block text-xs font-medium text-amber-900 dark:text-amber-200">
              🧪 Dev Mode: Test Images
            </label>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleTestImageSelect(e.target.value);
                  e.target.value = ""; // Reset select
                }
              }}
              disabled={isUploading || isParsing}
              className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-sm text-zinc-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500 dark:border-amber-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Select a test image...</option>
              {TEST_IMAGES.map((img) => (
                <option key={img.name} value={img.name}>
                  {img.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-3">
          <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {onRecipeParsed ? "Take Photo & Parse Recipe" : "Take Photo"}
            <input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isUploading || isParsing}
            />
          </label>

          {(isUploading || isParsing) && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
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
              {isParsing ? "Parsing recipe..." : "Uploading..."}
            </div>
          )}
        </div>
      </div>

      {onRecipeParsed && (
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Upload a photo of a written recipe to automatically extract recipe
          information.
        </p>
      )}
    </div>
  );
}
