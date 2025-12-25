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
  const [isEditing, setIsEditing] = useState(false);

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
    <div className="min-h-screen bg-background text-foreground">
      <main className="container px-4 py-6 sm:px-6 sm:py-8 lg:px-8 mx-auto">
        <div className="mx-auto max-w-2xl">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground py-2 px-4 rounded-full border border-border"
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

          <div className="my-10">
            <h1 className="mb-4 text-2xl font-bold sm:mb-8 sm:text-3xl">
              Create New Recipe
            </h1>
            {error && (
              <div className="mb-6 rounded-lg bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            )}
            {!parsedRecipe ? (
              // Input methods - show before recipe is parsed
              <div className="space-y-6">
                {/* <div className="space-y-4 rounded-lg bg-card p-6 shadow-sm">
                  <h2 className="text-xl font-semibold">
                    Record Voice Recipe
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Speak your recipe clearly, including ingredients and
                    instructions.
                  </p>
                  <VoiceInput onTranscriptionComplete={handleRecipeParsed} />
                </div> */}
                <div className="space-y-4 rounded-[0.35rem] bg-card p-6 border border-border">
                  <h2 className="text-xl font-semibold">Upload Photo</h2>
                  <p className="text-sm text-muted-foreground">
                    Take a photo of a written recipe to automatically extract
                    the information, and then share it with your kids✨
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
                <div className="space-y-4 rounded-[0.35rem] bg-card p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Review Recipe</h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(!isEditing)}
                        className="p-2 text-muted-foreground transition-colors hover:text-foreground"
                        aria-label={isEditing ? "Done editing" : "Edit recipe"}
                      >
                        {isEditing ? (
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setParsedRecipe(null)}
                        className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
                      >
                        Start Over
                      </button>
                    </div>
                  </div>
                  {/* Recipe Name - editable */}
                  <div>
                    <label className="mb-2 block text-sm font-medium">
                      Recipe Name
                    </label>
                    <input
                      type="text"
                      value={parsedRecipe.name}
                      onChange={(e) =>
                        setParsedRecipe({
                          ...parsedRecipe,
                          name: e.target.value,
                        })
                      }
                      className="w-full rounded-lg border border-input bg-card px-3 py-2 text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  {/* Recipe Preview */}
                  <div className="space-y-4 rounded-lg border border-border/50 bg-muted p-4">
                    <div>
                      <h3 className="mb-1 text-sm font-medium text-foreground">
                        Description
                      </h3>
                      {isEditing ? (
                        <textarea
                          value={parsedRecipe.description || ""}
                          onChange={(e) =>
                            setParsedRecipe({
                              ...parsedRecipe,
                              description: e.target.value || null,
                            })
                          }
                          placeholder="Add a description..."
                          className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px] resize-y"
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {parsedRecipe.description || (
                            <span className="italic text-muted-foreground/60">
                              No description
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-foreground">
                        Details
                      </h3>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              Cuisine Type
                            </label>
                            <input
                              type="text"
                              value={parsedRecipe.cuisine_type || ""}
                              onChange={(e) =>
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  cuisine_type: e.target.value || null,
                                })
                              }
                              placeholder="e.g., Italian"
                              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              Main Ingredient
                            </label>
                            <input
                              type="text"
                              value={parsedRecipe.main_ingredient || ""}
                              onChange={(e) =>
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  main_ingredient: e.target.value || null,
                                })
                              }
                              placeholder="e.g., Chicken"
                              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              Time (minutes)
                            </label>
                            <input
                              type="number"
                              value={parsedRecipe.time_estimation || 0}
                              onChange={(e) =>
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  time_estimation:
                                    parseInt(e.target.value) || 0,
                                })
                              }
                              min="0"
                              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-xs text-muted-foreground">
                              Servings
                            </label>
                            <input
                              type="number"
                              value={parsedRecipe.servings || ""}
                              onChange={(e) =>
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  servings: e.target.value
                                    ? parseInt(e.target.value)
                                    : null,
                                })
                              }
                              min="1"
                              placeholder="Optional"
                              className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {parsedRecipe.cuisine_type && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
                              {parsedRecipe.cuisine_type}
                            </span>
                          )}
                          {parsedRecipe.main_ingredient && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
                              {parsedRecipe.main_ingredient}
                            </span>
                          )}
                          {parsedRecipe.time_estimation > 0 && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
                              {parsedRecipe.time_estimation} min
                            </span>
                          )}
                          {parsedRecipe.servings && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
                              {parsedRecipe.servings} servings
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {parsedRecipe.ingredients.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-foreground">
                          Ingredients ({parsedRecipe.ingredients.length})
                        </h3>
                        {isEditing ? (
                          <div className="space-y-2">
                            {parsedRecipe.ingredients.map((ing, index) => (
                              <div
                                key={index}
                                className="flex gap-2 items-center"
                              >
                                <input
                                  type="text"
                                  value={ing.amount || ""}
                                  onChange={(e) => {
                                    const updated = [
                                      ...parsedRecipe.ingredients,
                                    ];
                                    updated[index] = {
                                      ...updated[index],
                                      amount: e.target.value || null,
                                    };
                                    setParsedRecipe({
                                      ...parsedRecipe,
                                      ingredients: updated,
                                    });
                                  }}
                                  placeholder="Amount"
                                  className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <input
                                  type="text"
                                  value={ing.name}
                                  onChange={(e) => {
                                    const updated = [
                                      ...parsedRecipe.ingredients,
                                    ];
                                    updated[index] = {
                                      ...updated[index],
                                      name: e.target.value,
                                    };
                                    setParsedRecipe({
                                      ...parsedRecipe,
                                      ingredients: updated,
                                    });
                                  }}
                                  placeholder="Ingredient name"
                                  className="flex-[2] rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated =
                                      parsedRecipe.ingredients.filter(
                                        (_, i) => i !== index
                                      );
                                    setParsedRecipe({
                                      ...parsedRecipe,
                                      ingredients: updated,
                                    });
                                  }}
                                  className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors"
                                  aria-label="Remove ingredient"
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
                            <button
                              type="button"
                              onClick={() => {
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  ingredients: [
                                    ...parsedRecipe.ingredients,
                                    { name: "", amount: null },
                                  ],
                                });
                              }}
                              className="w-full text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg py-2 transition-colors"
                            >
                              + Add Ingredient
                            </button>
                          </div>
                        ) : (
                          <ul className="space-y-1">
                            {parsedRecipe.ingredients.map((ing, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground"
                              >
                                {ing.amount && (
                                  <span className="font-medium">
                                    {ing.amount}{" "}
                                  </span>
                                )}
                                {ing.name}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    )}
                    {parsedRecipe.instructions.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-medium text-foreground">
                          Instructions ({parsedRecipe.instructions.length}{" "}
                          steps)
                        </h3>
                        {isEditing ? (
                          <div className="space-y-2">
                            {parsedRecipe.instructions.map((inst, index) => (
                              <div
                                key={index}
                                className="flex gap-3 items-start"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground mt-1">
                                  {index + 1}
                                </span>
                                <textarea
                                  value={inst.instruction}
                                  onChange={(e) => {
                                    const updated = [
                                      ...parsedRecipe.instructions,
                                    ];
                                    updated[index] = {
                                      instruction: e.target.value,
                                    };
                                    setParsedRecipe({
                                      ...parsedRecipe,
                                      instructions: updated,
                                    });
                                  }}
                                  className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring min-h-[60px] resize-y"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated =
                                      parsedRecipe.instructions.filter(
                                        (_, i) => i !== index
                                      );
                                    setParsedRecipe({
                                      ...parsedRecipe,
                                      instructions: updated,
                                    });
                                  }}
                                  className="p-2 text-destructive hover:bg-destructive/10 rounded transition-colors mt-1"
                                  aria-label="Remove instruction"
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
                            <button
                              type="button"
                              onClick={() => {
                                setParsedRecipe({
                                  ...parsedRecipe,
                                  instructions: [
                                    ...parsedRecipe.instructions,
                                    { instruction: "" },
                                  ],
                                });
                              }}
                              className="w-full text-sm text-muted-foreground hover:text-foreground border border-dashed border-border rounded-lg py-2 transition-colors"
                            >
                              + Add Instruction
                            </button>
                          </div>
                        ) : (
                          <ol className="space-y-2">
                            {parsedRecipe.instructions.map((inst, index) => (
                              <li
                                key={index}
                                className="flex gap-3 text-sm text-muted-foreground"
                              >
                                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                                  {index + 1}
                                </span>
                                <span className="flex-1">
                                  {inst.instruction}
                                </span>
                              </li>
                            ))}
                          </ol>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Image upload for recipe image (if not already uploaded) */}
                  {!imageUrl && !parsedRecipe.image_url && (
                    <div>
                      <label className="mb-2 block text-sm font-medium">
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
                      className="flex h-11 flex-1 items-center justify-center rounded-full border border-border px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={isSubmitting || !parsedRecipe.name.trim()}
                      className="flex h-11 flex-1 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors disabled:opacity-50 hover:bg-primary/90"
                    >
                      {isSubmitting ? "Creating..." : "Create Recipe"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
