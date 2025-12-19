'use client';

import { useState } from 'react';

export interface InstructionItem {
  instruction: string;
}

interface DynamicInstructionListProps {
  instructions: InstructionItem[];
  onChange: (instructions: InstructionItem[]) => void;
}

export function DynamicInstructionList({
  instructions,
  onChange,
}: DynamicInstructionListProps) {
  const addInstruction = () => {
    onChange([...instructions, { instruction: '' }]);
  };

  const removeInstruction = (index: number) => {
    onChange(instructions.filter((_, i) => i !== index));
  };

  const updateInstruction = (index: number, value: string) => {
    const updated = [...instructions];
    updated[index] = { instruction: value };
    onChange(updated);
  };

  const moveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...instructions];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    onChange(updated);
  };

  const moveDown = (index: number) => {
    if (index === instructions.length - 1) return;
    const updated = [...instructions];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium">
          Instructions
        </label>
        <button
          type="button"
          onClick={addInstruction}
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
        >
          + Add step
        </button>
      </div>
      {instructions.map((item, index) => (
        <div key={index} className="flex gap-2">
          <div className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className="flex h-5 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => moveDown(index)}
              disabled={index === instructions.length - 1}
              className="flex h-5 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-30"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary/20 text-sm font-semibold text-secondary">
              {index + 1}
            </span>
            <textarea
              placeholder="Instruction step..."
              value={item.instruction}
              onChange={(e) => updateInstruction(index, e.target.value)}
              rows={2}
              className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              type="button"
              onClick={() => removeInstruction(index)}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
      {instructions.length === 0 && (
        <button
          type="button"
          onClick={addInstruction}
          className="w-full rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          + Add first step
        </button>
      )}
    </div>
  );
}
