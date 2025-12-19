'use client';

import { useState } from 'react';
import { RecipeInstruction } from '@/types/recipe';

interface LetsCookModeProps {
  instructions: RecipeInstruction[];
  onExit: () => void;
}

export function LetsCookMode({ instructions, onExit }: LetsCookModeProps) {
  const sortedInstructions = [...instructions].sort(
    (a, b) => a.order - b.order
  );
  const [currentStep, setCurrentStep] = useState(0);

  const currentInstruction = sortedInstructions[currentStep];
  const totalSteps = sortedInstructions.length;

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  if (sortedInstructions.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <button
            onClick={onExit}
            className="flex h-11 min-w-[88px] items-center justify-center rounded-full border border-border px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Exit
          </button>
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
          <div className="min-w-[88px]" /> {/* Spacer for alignment */}
        </div>

        {/* Main Content */}
        <div className="flex flex-1 items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="mb-8 text-center">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                {currentInstruction.step_number}
              </div>
            </div>
            <p className="text-center text-2xl leading-relaxed sm:text-3xl">
              {currentInstruction.instruction}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-border p-4">
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-border px-6 text-base font-medium text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted"
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={currentStep === totalSteps - 1}
              className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-medium text-primary-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-50 hover:bg-primary/90"
            >
              Next
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
