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

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a recipe extraction assistant. Extract recipe information from the provided text and return it as JSON. 
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

Parse the text carefully and extract all recipe information. For time_estimation, convert to minutes if needed.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(content);
    const validated = RecipeSchema.parse(parsed);

    return NextResponse.json(validated);
  } catch (error) {
    console.error("Recipe parsing error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid recipe format", details: error },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to parse recipe" },
      { status: 500 }
    );
  }
}
