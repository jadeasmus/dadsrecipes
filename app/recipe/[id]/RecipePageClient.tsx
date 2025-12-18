'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RecipeWithDetails } from '@/types/recipe';
import { RecipeHeader } from '@/components/RecipeHeader';
import { IngredientsList } from '@/components/IngredientsList';
import { InstructionsView } from '@/components/InstructionsView';
import { LetsCookMode } from '@/components/LetsCookMode';
import { ShareButton } from '@/components/ShareButton';

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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-3xl">
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
          <RecipeHeader recipe={recipe} />
          <IngredientsList ingredients={recipe.ingredients} />
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setIsLetsCookMode(true)}
              className="flex h-11 flex-1 items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              Let's Cook!
            </button>
            <ShareButton recipeUrl={`/recipe/${recipe.id}`} />
          </div>
          <InstructionsView instructions={recipe.instructions} />
        </div>
      </main>
    </div>
  );
}

