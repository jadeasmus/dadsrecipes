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
      <h2 className="mb-4 text-2xl font-semibold">
        Instructions
      </h2>
      <ol className="space-y-6">
        {sortedInstructions.map((instruction) => (
          <li
            key={instruction.id}
            className="flex gap-4 text-foreground"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              {instruction.step_number}
            </span>
            <span className="flex-1 pt-1">{instruction.instruction}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
