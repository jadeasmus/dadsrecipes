import Image from "next/image";
import { Recipe } from "@/types/recipe";
import { ShareButton } from "@/components/ShareButton";

interface RecipeHeaderProps {
  recipe: Recipe;
  recipeUrl?: string;
}

export function RecipeHeader({ recipe, recipeUrl }: RecipeHeaderProps) {
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
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold sm:text-4xl">{recipe.name}</h1>
        {recipeUrl && <ShareButton recipeUrl={recipeUrl} />}
      </div>
      {recipe.description && (
        <p className="mb-6 text-lg text-muted-foreground">
          {recipe.description}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        {recipe.cuisine_type && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
            {recipe.cuisine_type}
          </span>
        )}
        {recipe.main_ingredient && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
            {recipe.main_ingredient}
          </span>
        )}
        {recipe.time_estimation && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
            {recipe.time_estimation} min
          </span>
        )}
        {recipe.servings && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
            {recipe.servings} servings
          </span>
        )}
        {recipe.health_score !== null && (
          <span className="rounded-full bg-secondary px-3 py-1 text-sm text-black/80">
            Health: {recipe.health_score}/100
          </span>
        )}
      </div>
    </div>
  );
}
