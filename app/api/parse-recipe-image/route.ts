import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const RecipeSchema = z.object({
  name: z.string(),
  description: z.string().optional().nullable(),
  cuisine_type: z.string().optional().nullable(),
  main_ingredient: z.string().optional().nullable(),
  time_estimation: z.number(),
  servings: z.number().optional().nullable(),
  health_score: z.number().min(0).max(100).optional().nullable(),
  ingredients: z.array(
    z.object({
      name: z.string(),
      amount: z.string().optional().nullable(),
    })
  ),
  instructions: z.array(z.object({ instruction: z.string() })),
});

async function parseImage(imageFile: File): Promise<z.infer<typeof RecipeSchema>> {
  // Convert File to base64
  const arrayBuffer = await imageFile.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64Image = buffer.toString("base64");
  const dataUrl = `data:${imageFile.type};base64,${base64Image}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a recipe extraction assistant. Extract recipe information from the provided image of a written recipe and return it as JSON. 
The JSON should have the following structure:
{
  "name": "Recipe name",
  "description": "Optional description",
  "cuisine_type": "Optional cuisine type (e.g., Mexican, Italian)",
  "main_ingredient": "Optional main ingredient (e.g., Beef, Chicken)",
  "time_estimation": number in minutes,
  "servings": optional number,
  "health_score": optional number 0-100,
  "ingredients": [{"name": "ingredient name", "amount": "optional amount"}],
  "instructions": [{"instruction": "step text"}]
}

Read the image carefully and extract all recipe information. For time_estimation, convert to minutes if needed.`,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Extract the recipe information from this image and return it as JSON. If the required information is not present, use common sense to make a reasonable guess. Don't leave any fields blank.",
          },
          {
            type: "image_url",
            image_url: {
              url: dataUrl,
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    temperature: 0.3,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  // Extract JSON from markdown code blocks if present
  let jsonContent = content;
  const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    jsonContent = jsonMatch[1];
  }

  const parsed = JSON.parse(jsonContent);
  return RecipeSchema.parse(parsed);
}

function mergeRecipes(recipes: z.infer<typeof RecipeSchema>[]): z.infer<typeof RecipeSchema> {
  if (recipes.length === 0) {
    throw new Error("No recipes to merge");
  }

  if (recipes.length === 1) {
    return recipes[0];
  }

  // Use first recipe as base
  const merged = { ...recipes[0] };

  // Merge ingredients - deduplicate by name (case-insensitive)
  const ingredientMap = new Map<string, { name: string; amount?: string | null }>();
  
  recipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      const key = ing.name.toLowerCase().trim();
      if (!ingredientMap.has(key)) {
        ingredientMap.set(key, { ...ing });
      } else {
        // If amounts differ, prefer the more specific one (non-null)
        const existing = ingredientMap.get(key)!;
        if (!existing.amount && ing.amount) {
          existing.amount = ing.amount;
        } else if (existing.amount && ing.amount && existing.amount !== ing.amount) {
          // If both have amounts and they differ, combine them
          existing.amount = `${existing.amount}, ${ing.amount}`;
        }
      }
    });
  });

  merged.ingredients = Array.from(ingredientMap.values());

  // Merge instructions - combine all instruction arrays in order
  merged.instructions = recipes.flatMap((recipe) => recipe.instructions);

  // Aggregate time_estimation (sum all times)
  merged.time_estimation = recipes.reduce(
    (sum, recipe) => sum + (recipe.time_estimation || 0),
    0
  );

  // Use first non-null value for other fields, or combine if appropriate
  for (let i = 1; i < recipes.length; i++) {
    const recipe = recipes[i];
    
    // Description: combine if different
    if (recipe.description && recipe.description !== merged.description) {
      if (merged.description) {
        merged.description = `${merged.description}. ${recipe.description}`;
      } else {
        merged.description = recipe.description;
      }
    }

    // Servings: use first non-null, or max if both present
    if (recipe.servings && !merged.servings) {
      merged.servings = recipe.servings;
    } else if (recipe.servings && merged.servings) {
      merged.servings = Math.max(merged.servings, recipe.servings);
    }

    // Health score: average if both present
    if (recipe.health_score !== null && recipe.health_score !== undefined) {
      if (merged.health_score !== null && merged.health_score !== undefined) {
        merged.health_score = Math.round(
          (merged.health_score + recipe.health_score) / 2
        );
      } else {
        merged.health_score = recipe.health_score;
      }
    }

    // Cuisine type: use first, or combine if different
    if (recipe.cuisine_type && recipe.cuisine_type !== merged.cuisine_type) {
      if (merged.cuisine_type) {
        merged.cuisine_type = `${merged.cuisine_type}, ${recipe.cuisine_type}`;
      } else {
        merged.cuisine_type = recipe.cuisine_type;
      }
    }

    // Main ingredient: use first, or combine if different
    if (recipe.main_ingredient && recipe.main_ingredient !== merged.main_ingredient) {
      if (merged.main_ingredient) {
        merged.main_ingredient = `${merged.main_ingredient}, ${recipe.main_ingredient}`;
      } else {
        merged.main_ingredient = recipe.main_ingredient;
      }
    }
  }

  return merged;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFiles = formData.getAll("image") as File[];

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json(
        { error: "No image files provided" },
        { status: 400 }
      );
    }

    // Parse all images
    const parsePromises = imageFiles.map((file) => parseImage(file));
    const parsedRecipes = await Promise.all(parsePromises);

    // Merge all parsed recipes into one
    const mergedRecipe = mergeRecipes(parsedRecipes);

    return NextResponse.json(mergedRecipe);
  } catch (error) {
    console.error("Recipe image parsing error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid recipe format", details: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to parse recipe from images" },
      { status: 500 }
    );
  }
}
