import Image from 'next/image';
import { Recipe } from '@/types/recipe';

interface RecipeHeaderProps {
  recipe: Recipe;
}

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  return (
    <div className="mb-8">
      {recipe.image_url && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-800">
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>
      )}
      <h1 className="mb-4 text-3xl font-bold text-zinc-900 dark:text-zinc-50 sm:text-4xl">
        {recipe.name}
      </h1>
      {recipe.description && (
        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-400">
          {recipe.description}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {recipe.cuisine_type && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {recipe.cuisine_type}
          </span>
        )}
        {recipe.main_ingredient && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {recipe.main_ingredient}
          </span>
        )}
        {recipe.time_estimation && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {recipe.time_estimation} min
          </span>
        )}
        {recipe.servings && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            {recipe.servings} servings
          </span>
        )}
        {recipe.health_score !== null && (
          <span className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
            Health: {recipe.health_score}/100
          </span>
        )}
      </div>
    </div>
  );
}

