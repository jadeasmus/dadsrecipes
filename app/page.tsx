import Link from "next/link";
import Image from "next/image";
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
      <main className="container mx-auto px-4 pb-10 pt-0 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="relative -mx-4 mb-6 overflow-hidden border-b-2 border-dashed bg-gradient-to-b from-[#d7e7ff] via-[#c9ddff] to-[#f6f9ff] px-4 py-12 sm:-mx-6 sm:py-16 lg:-mx-8 lg:px-12 lg:py-20">
          <div className="absolute left-0 top-0 h-1 w-full bg-primary" />
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(0,0,0,0.08) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.08) 1px, transparent 1px)
              `,
              backgroundSize: "32px 32px",
            }}
          />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 30% 20%, rgba(255, 223, 99, 0.35), transparent 32%), radial-gradient(circle at 70% 30%, rgba(255, 82, 82, 0.35), transparent 30%)",
            }}
          />

          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center">
            <div className="relative -mt-6 w-full max-w-3xl">
              <div className="relative mx-auto w-full max-w-2xl">
                <Image
                  src="/heirloomtomato.png"
                  alt="Dad's Recipes"
                  width={900}
                  height={560}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <div className="mb-10 flex flex-col gap-3 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">Recipes</h1>
          <Link
            href="/recipe/new"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 sm:w-auto sm:min-w-[140px]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-circle-plus-icon lucide-circle-plus"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12h8" />
              <path d="M12 8v8" />
            </svg>
            <span className="ml-2 text-lg">Add a Recipe</span>
          </Link>
        </div>
        <RecipeGrid recipes={(recipes as Recipe[]) || []} />
      </main>
    </div>
  );
}
