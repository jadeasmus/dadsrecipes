import { RecipeIngredient } from '@/types/recipe';

interface IngredientsListProps {
  ingredients: RecipeIngredient[];
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
  const sortedIngredients = [...ingredients].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Ingredients
      </h2>
      <ul className="space-y-2">
        {sortedIngredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex items-start text-zinc-700 dark:text-zinc-300"
          >
            <span className="mr-3 mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-zinc-400 dark:bg-zinc-600" />
            <span className="flex-1">
              {ingredient.amount && (
                <span className="font-medium">{ingredient.amount} </span>
              )}
              <span>{ingredient.name}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

