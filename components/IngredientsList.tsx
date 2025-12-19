import { RecipeIngredient } from '@/types/recipe';

interface IngredientsListProps {
  ingredients: RecipeIngredient[];
}

export function IngredientsList({ ingredients }: IngredientsListProps) {
  const sortedIngredients = [...ingredients].sort((a, b) => a.order - b.order);

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold">
        Ingredients
      </h2>
      <ul className="space-y-2">
        {sortedIngredients.map((ingredient) => (
          <li
            key={ingredient.id}
            className="flex items-start text-muted-foreground"
          >
            <span className="mr-3 mt-1.5 flex h-2 w-2 shrink-0 items-center justify-center rounded-full bg-primary" />
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
