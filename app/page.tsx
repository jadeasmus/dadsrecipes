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
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl dark:text-zinc-50">
            Recipes
          </h1>
          <Link
            href="/recipe/new"
            className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-6 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 sm:w-auto sm:min-w-[120px]"
          >
            + Create Recipe
          </Link>
        </div>
        <RecipeGrid recipes={(recipes as Recipe[]) || []} />
      </main>
    </div>
  );
}
