import Image from "next/image";
import Link from "next/link";
import { Recipe } from "@/types/recipe";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group relative block h-full w-full overflow-hidden rounded-lg bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
        )}
      </div>
      <div className="relative flex flex-col p-4 w-full">
        <h3 className="text-lg font-semibold">{recipe.name}</h3>
        {recipe.time_estimation && (
          <p className="mt-1 text-sm text-muted-foreground">
            {recipe.time_estimation} min
          </p>
        )}
        {(recipe.cuisine_type || recipe.main_ingredient || recipe.servings) && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {recipe.cuisine_type && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {recipe.cuisine_type}
              </span>
            )}
            {recipe.main_ingredient && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {recipe.main_ingredient}
              </span>
            )}
            {recipe.servings && (
              <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {recipe.servings}{" "}
                {recipe.servings === 1 ? "serving" : "servings"}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
