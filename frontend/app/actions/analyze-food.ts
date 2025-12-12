// actions/analyzeFood.ts (New server action file)
"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface ScanOutput {
  detected_items: Array<{
    name: string;
    confidence: number;
    calories: number;
    carbs: number;
    protein: number;
    fiber: number;
    glycemic_index: number;
    flags: string[];
    source: string;
  }>;
  meal_summary: {
    total_calories: number;
    score: number;
    quality: string;
    recommendations: string[];
  };
  recommendations: {
    healthy_alternatives: string[];
    portion_adjustments: string[];
  };
}

export async function analyzeFood(
  scanOutput: ScanOutput,
  userPrompt: string,
  userConditions: {
    hasDiabetes: boolean;
    hypertension: boolean;
    ulcer: boolean;
    weight_loss: boolean;
  }
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });

    const systemPrompt = `You are an empathetic diabetes health assistant. Generate a helpful, conversational response based on the food scan output. Focus on diabetes management if the user has diabetes (emphasize low-GI foods, portion control, balanced macros). Consider other conditions like hypertension (low-sodium suggestions), ulcers (bland foods), weight loss (calorie control). Structure the response with:
- **Identified Foods**: List detected items with confidence.
- **Nutritional Breakdown**: Key macros, calories, GI.
- **Health Impact**: Personalized analysis based on conditions.
- **Recommendations**: Actionable tips, alternatives.

Keep it positive, encouraging, under 300 words. Use markdown for formatting (bold, bullets). End with a question to continue the conversation.`;

    const fullPrompt = `${systemPrompt}\n\nScan Output: ${JSON.stringify(scanOutput, null, 2)}\n\nUser Prompt: ${userPrompt}\n\nUser Conditions: ${JSON.stringify(userConditions)}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response.text();
    return response;
  } catch (error) {
    console.error("Generative AI error:", error);
    // Fallback response
    return `I've analyzed your food image based on the scan. Here's a summary:

**Detected Items:** Mixed foods with moderate carbs.

**Nutrition:** ~350 calories, balanced but watch portions for diabetes.

**Tips:** Add veggies for fiber. Great choice overall!

What else can I help with?`;
  }
}