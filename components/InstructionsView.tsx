import { RecipeInstruction } from '@/types/recipe';

interface InstructionsViewProps {
  instructions: RecipeInstruction[];
}

export function InstructionsView({ instructions }: InstructionsViewProps) {
  const sortedInstructions = [...instructions].sort(
    (a, b) => a.order - b.order
  );

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Instructions
      </h2>
      <ol className="space-y-6">
        {sortedInstructions.map((instruction) => (
          <li
            key={instruction.id}
            className="flex gap-4 text-zinc-700 dark:text-zinc-300"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
              {instruction.step_number}
            </span>
            <span className="flex-1 pt-1">{instruction.instruction}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

