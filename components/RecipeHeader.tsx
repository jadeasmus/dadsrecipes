import Image from 'next/image';
import { Recipe } from '@/types/recipe';

interface RecipeHeaderProps {
  recipe: Recipe;
}

export function RecipeHeader({ recipe }: RecipeHeaderProps) {
  return (
    <div className="mb-8">
      {recipe.image_url && (
        <div className="relative mb-6 aspect-[16/9] w-full overflow-hidden rounded-lg bg-muted">
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
      <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
        {recipe.name}
      </h1>
      {recipe.description && (
        <p className="mb-6 text-lg text-muted-foreground">
          {recipe.description}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {recipe.cuisine_type && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
            {recipe.cuisine_type}
          </span>
        )}
        {recipe.main_ingredient && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
            {recipe.main_ingredient}
          </span>
        )}
        {recipe.time_estimation && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
            {recipe.time_estimation} min
          </span>
        )}
        {recipe.servings && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
            {recipe.servings} servings
          </span>
        )}
        {recipe.health_score !== null && (
          <span className="rounded-full bg-secondary/20 px-3 py-1 text-sm text-secondary">
            Health: {recipe.health_score}/100
          </span>
        )}
      </div>
    </div>
  );
}
