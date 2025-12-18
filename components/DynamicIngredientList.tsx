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
        <label className="text-base font-medium text-zinc-900 dark:text-zinc-50">
          Ingredients
        </label>
        <button
          type="button"
          onClick={addIngredient}
          className="text-sm text-zinc-600 underline hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
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
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <input
            type="text"
            placeholder="Ingredient name"
            value={ingredient.name}
            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
          <button
            type="button"
            onClick={() => removeIngredient(index)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
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
          className="w-full rounded-lg border-2 border-dashed border-zinc-300 py-4 text-sm text-zinc-600 hover:border-zinc-400 hover:text-zinc-900 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-50"
        >
          + Add first ingredient
        </button>
      )}
    </div>
  );
}

