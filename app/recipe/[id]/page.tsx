import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { RecipeHeader } from '@/components/RecipeHeader';
import { IngredientsList } from '@/components/IngredientsList';
import { InstructionsView } from '@/components/InstructionsView';
import { LetsCookMode } from '@/components/LetsCookMode';
import { RecipePageClient } from './RecipePageClient';
import { RecipeWithDetails } from '@/types/recipe';

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

async function getRecipe(id: string): Promise<RecipeWithDetails | null> {
  const supabase = await createClient();

  const { data: recipe, error: recipeError } = await supabase
    .from('recipes')
    .select('*')
    .eq('id', id)
    .single();

  if (recipeError || !recipe) {
    return null;
  }

  const { data: ingredients, error: ingredientsError } = await supabase
    .from('recipe_ingredients')
    .select('*')
    .eq('recipe_id', id)
    .order('order', { ascending: true });

  if (ingredientsError) {
    console.error('Error fetching ingredients:', ingredientsError);
  }

  const { data: instructions, error: instructionsError } = await supabase
    .from('recipe_instructions')
    .select('*')
    .eq('recipe_id', id)
    .order('order', { ascending: true });

  if (instructionsError) {
    console.error('Error fetching instructions:', instructionsError);
  }

  return {
    ...recipe,
    ingredients: (ingredients || []) as RecipeWithDetails['ingredients'],
    instructions: (instructions || []) as RecipeWithDetails['instructions'],
  } as RecipeWithDetails;
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  return (
    <RecipePageClient recipe={recipe} />
  );
}

