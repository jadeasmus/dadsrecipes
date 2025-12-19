'use client';

import { useState } from 'react';

export interface IngredientItem {
  name: string;
  amount: string;
}

interface DynamicIngredientListProps {
  ingredients: IngredientItem[];
  onChange: (ingredients: IngredientItem[]) => void;
}

export function DynamicIngredientList({
  ingredients,
  onChange,
}: DynamicIngredientListProps) {
  const addIngredient = () => {
    onChange([...ingredients, { name: '', amount: '' }]);
  };

  const removeIngredient = (index: number) => {
    onChange(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (index: number, field: 'name' | 'amount', value: string) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-base font-medium">
          Ingredients
        </label>
        <button
          type="button"
          onClick={addIngredient}
          className="text-sm text-muted-foreground underline transition-colors hover:text-foreground"
        >
          + Add ingredient
        </button>
      </div>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            placeholder="Amount (e.g., 2 cups)"
            value={ingredient.amount}
            onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
            className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="text"
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            className="flex-1 rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
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
      ))}
      {ingredients.length === 0 && (
        <button
          type="button"
          onClick={addIngredient}
          className="w-full rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
        >
          + Add first ingredient
        </button>
      )}
    </div>
  );
}
