import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RecipeGrid } from "@/components/RecipeGrid";
import { Recipe } from "@/types/recipe";

export default async function Home() {
  const supabase = await createClient();
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching recipes:", error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">
            Recipes
          </h1>
          <Link
            href="/recipe/new"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:min-w-[120px]"
          >
            + Create Recipe
          </Link>
        </div>
        <RecipeGrid recipes={(recipes as Recipe[]) || []} />
      </main>
    </div>
  );
}
