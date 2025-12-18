export interface Recipe {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  cuisine_type: string | null;
  main_ingredient: string | null;
  time_estimation: number;
  health_score: number | null;
  servings: number | null;
  created_at: string;
  updated_at: string;
}

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  amount: string | null;
  order: number;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction: string;
  order: number;
}

export interface RecipeWithDetails extends Recipe {
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
}

export interface CreateRecipeInput {
  name: string;
  description?: string | null;
  image_url?: string | null;
  cuisine_type?: string | null;
  main_ingredient?: string | null;
  time_estimation: number;
  health_score?: number | null;
  servings?: number | null;
  ingredients: Omit<RecipeIngredient, 'id' | 'recipe_id'>[];
  instructions: Omit<RecipeInstruction, 'id' | 'recipe_id'>[];
}

