"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VoiceInput } from "@/components/VoiceInput";
import { ImageUpload } from "@/components/ImageUpload";
import { createClient } from "@/lib/supabase/client";

interface ParsedRecipeData {
  name: string;
  description?: string | null;
  cuisine_type?: string | null;
  main_ingredient?: string | null;
  time_estimation: number;
  servings?: number | null;
  health_score?: number | null;
  image_url?: string | null;
  ingredients: Array<{ name: string; amount?: string | null }>;
  instructions: Array<{ instruction: string }>;
}

export default function NewRecipePage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipeData | null>(
    null
  );
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleRecipeParsed = (recipeData: any) => {
    // Normalize the parsed data
    const normalized: ParsedRecipeData = {
      name: recipeData.name || "Untitled Recipe",
      description: recipeData.description || null,
      cuisine_type: recipeData.cuisine_type || null,
      main_ingredient: recipeData.main_ingredient || null,
      time_estimation: recipeData.time_estimation || 0,
      servings: recipeData.servings || null,
      health_score: recipeData.health_score || null,
      image_url: imageUrl || recipeData.image_url || null,
      ingredients: recipeData.ingredients || [],
      instructions: recipeData.instructions || [],
    };
    setParsedRecipe(normalized);
  };

  const handleImageUploaded = (url: string) => {
    setImageUrl(url);
    if (parsedRecipe) {
      setParsedRecipe({ ...parsedRecipe, image_url: url });
    }
  };

  const handleSubmit = async () => {
    if (!parsedRecipe) return;

    setError(null);
    setIsSubmitting(true);

    try {
      // Insert recipe
      const { data: recipe, error: recipeError } = await supabase
        .from("recipes")
        .insert({
          name: parsedRecipe.name,
          description: parsedRecipe.description,
          cuisine_type: parsedRecipe.cuisine_type,
          main_ingredient: parsedRecipe.main_ingredient,
          time_estimation: parsedRecipe.time_estimation,
          servings: parsedRecipe.servings,
          health_score: parsedRecipe.health_score,
          image_url: parsedRecipe.image_url || imageUrl,
        })
        .select()
        .single();

      if (recipeError) throw recipeError;

      // Insert ingredients
      if (parsedRecipe.ingredients.length > 0) {
        const ingredientsToInsert = parsedRecipe.ingredients
          .filter((ing) => ing.name.trim())
          .map((ing, index) => ({
            recipe_id: recipe.id,
            name: ing.name.trim(),
            amount: ing.amount?.trim() || null,
            order: index,
          }));

        if (ingredientsToInsert.length > 0) {
          const { error: ingredientsError } = await supabase
            .from("recipe_ingredients")
            .insert(ingredientsToInsert);

          if (ingredientsError) throw ingredientsError;
        }
      }

      // Insert instructions
      if (parsedRecipe.instructions.length > 0) {
        const instructionsToInsert = parsedRecipe.instructions
          .filter((inst) => inst.instruction.trim())
          .map((inst, index) => ({
            recipe_id: recipe.id,
            step_number: index + 1,
            instruction: inst.instruction.trim(),
            order: index,
          }));

        if (instructionsToInsert.length > 0) {
          const { error: instructionsError } = await supabase
            .from("recipe_instructions")
            .insert(instructionsToInsert);

          if (instructionsError) throw instructionsError;
        }
      }

      router.push(`/recipe/${recipe.id}`);
    } catch (err) {
      console.error("Error creating recipe:", err);
      setError(err instanceof Error ? err.message : "Failed to create recipe");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          >
            <svg
              className="mr-2 h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Recipes
          </Link>
          <h1 className="mb-6 text-2xl font-bold text-zinc-900 sm:mb-8 sm:text-3xl dark:text-zinc-50">
            Create New Recipe
          </h1>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </div>
          )}

          {!parsedRecipe ? (
            // Input methods - show before recipe is parsed
            <div className="space-y-6">
              <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Record Voice Recipe
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Speak your recipe clearly, including ingredients and
                  instructions.
                </p>
                <VoiceInput onTranscriptionComplete={handleRecipeParsed} />
              </div>

              <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                  Upload Recipe Photo
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Take a photo of a written recipe to automatically extract the
                  information.
                </p>
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onRecipeParsed={handleRecipeParsed}
                />
              </div>
            </div>
          ) : (
            // Review parsed recipe
            <div className="space-y-6">
              <div className="space-y-4 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    Review Recipe
                  </h2>
                  <button
                    type="button"
                    onClick={() => setParsedRecipe(null)}
                    className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  >
                    Start Over
                  </button>
                </div>

                {/* Recipe Name - editable */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                    Recipe Name
                  </label>
                  <input
                    type="text"
                    value={parsedRecipe.name}
                    onChange={(e) =>
                      setParsedRecipe({ ...parsedRecipe, name: e.target.value })
                    }
                    className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </div>

                {/* Recipe Preview */}
                <div className="space-y-4 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-950">
                  {parsedRecipe.description && (
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Description
                      </h3>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {parsedRecipe.description}
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {parsedRecipe.cuisine_type && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {parsedRecipe.cuisine_type}
                      </span>
                    )}
                    {parsedRecipe.main_ingredient && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {parsedRecipe.main_ingredient}
                      </span>
                    )}
                    {parsedRecipe.time_estimation > 0 && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {parsedRecipe.time_estimation} min
                      </span>
                    )}
                    {parsedRecipe.servings && (
                      <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                        {parsedRecipe.servings} servings
                      </span>
                    )}
                  </div>

                  {parsedRecipe.ingredients.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Ingredients ({parsedRecipe.ingredients.length})
                      </h3>
                      <ul className="space-y-1">
                        {parsedRecipe.ingredients.map((ing, index) => (
                          <li
                            key={index}
                            className="text-sm text-zinc-600 dark:text-zinc-400"
                          >
                            {ing.amount && (
                              <span className="font-medium">{ing.amount} </span>
                            )}
                            {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {parsedRecipe.instructions.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Instructions ({parsedRecipe.instructions.length} steps)
                      </h3>
                      <ol className="space-y-2">
                        {parsedRecipe.instructions.map((inst, index) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm text-zinc-600 dark:text-zinc-400"
                          >
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-300 text-xs font-semibold text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300">
                              {index + 1}
                            </span>
                            <span className="flex-1">{inst.instruction}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Image upload for recipe image (if not already uploaded) */}
                {!imageUrl && !parsedRecipe.image_url && (
                  <div>
                    <label className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      Recipe Image (optional)
                    </label>
                    <ImageUpload
                      onImageUploaded={(url) => {
                        setImageUrl(url);
                        setParsedRecipe({ ...parsedRecipe, image_url: url });
                      }}
                      // Don't parse recipe from this image upload - it's just for the recipe image
                    />
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-11 flex-1 items-center justify-center rounded-full border border-zinc-300 px-6 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || !parsedRecipe.name.trim()}
                    className="flex h-11 flex-1 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                  >
                    {isSubmitting ? "Creating..." : "Create Recipe"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
