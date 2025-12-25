"use client";

import { useState } from "react";
import Link from "next/link";
import { RecipeWithDetails } from "@/types/recipe";
import { RecipeHeader } from "@/components/RecipeHeader";
import { IngredientsList } from "@/components/IngredientsList";
import { InstructionsView } from "@/components/InstructionsView";
import { LetsCookMode } from "@/components/LetsCookMode";

interface RecipePageClientProps {
  recipe: RecipeWithDetails;
}

export function RecipePageClient({ recipe }: RecipePageClientProps) {
  const [isLetsCookMode, setIsLetsCookMode] = useState(false);

  if (isLetsCookMode) {
    return (
      <LetsCookMode
        instructions={recipe.instructions}
        onExit={() => setIsLetsCookMode(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="mb-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
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
          <RecipeHeader recipe={recipe} recipeUrl={`/recipe/${recipe.id}`} />
          <IngredientsList ingredients={recipe.ingredients} />
          <div className="mb-8">
            <button
              onClick={() => setIsLetsCookMode(true)}
              className="inline-flex justify-center items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-transform hover:scale-105 sm:px-8 sm:py-4 sm:text-lg"
              style={{
                boxShadow: "4px 4px 0px 0px rgba(0, 0, 0, 1)",
              }}
            >
              <span className="text-xl">Let's Cook!</span>
            </button>
          </div>
          <InstructionsView instructions={recipe.instructions} />
        </div>
      </main>
    </div>
  );
}
