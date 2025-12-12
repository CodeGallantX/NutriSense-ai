// actions/chat.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
'use server';

import { createServerClient } from '@/lib/supabase/server';
import { Mistral } from '@mistralai/mistralai';
import { revalidatePath } from 'next/cache';
import { ScanOutput } from './analyze-food';
import { Profile } from '@/types/database';

const apiKey = process.env.MISTRAL_API_KEY;
const client = new Mistral({ apiKey: apiKey! });

type Role = 'system' | 'user' | 'assistant';
type MistralChatMessage = {
  role: Role;
  content: string;
};

// Enhanced user information structure
export type EnhancedUserInfo = {
  // Basic Demographics
  basicInfo: {
    name: string | null;
    age: number | null;
    gender: string | null;
    location: string | null;
    email: string;
  };
  
  // Physical Metrics
  physical: {
    weightKg: number | null;
    heightCm: number | null;
    bmi: number | null;
    activityLevel: string | null;
  };
  
  // Health Profile
  health: {
    hasDiabetes: boolean;
    diabetesType: string | null;
    bloodSugarRange: { min: number | null; max: number | null };
    conditions: string[];
    allergies: string[];
    dietaryPreferences: string[];
  };
  
  // Goals & Preferences
  goals: {
    primaryGoal: string | null;
    secondaryGoals: string[];
    eatingPattern: string | null;
    cuisinePreferences: string[];
    weeklyBudget: string | null;
  };
};

// Calculate BMI if weight and height are available
function calculateBMI(weightKg: number | null, heightCm: number | null): number | null {
  if (!weightKg || !heightCm || heightCm === 0) return null;
  const heightM = heightCm / 100;
  return parseFloat((weightKg / (heightM * heightM)).toFixed(1));
}

export async function getUserProfile(userId: string): Promise<Profile | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

// Enhanced function to get comprehensive user info
export async function getEnhancedUserInfo(userId: string): Promise<EnhancedUserInfo | null> {
  const profile = await getUserProfile(userId);
  if (!profile) return null;

  const location = profile.country 
    ? (profile.region ? `${profile.region}, ${profile.country}` : profile.country)
    : null;

  return {
    basicInfo: {
      name: profile.full_name,
      age: profile.age,
      gender: profile.gender,
      location,
      email: profile.email
    },
    physical: {
      weightKg: profile.weight_kg,
      heightCm: profile.height_cm,
      bmi: calculateBMI(profile.weight_kg, profile.height_cm),
      activityLevel: profile.activity_level
    },
    health: {
      hasDiabetes: profile.has_diabetes,
      diabetesType: profile.diabetes_type,
      bloodSugarRange: {
        min: profile.target_blood_sugar_min,
        max: profile.target_blood_sugar_max
      },
      conditions: profile.health_conditions || [],
      allergies: profile.allergies || [],
      dietaryPreferences: profile.dietary_preferences || []
    },
    goals: {
      primaryGoal: profile.primary_goal,
      secondaryGoals: profile.secondary_goals || [],
      eatingPattern: profile.eating_pattern,
      cuisinePreferences: profile.cuisine_preferences || [],
      weeklyBudget: profile.weekly_budget
    }
  };
}

// Create a comprehensive system prompt based on user info
function createSystemPrompt(userInfo: EnhancedUserInfo): string {
  const { basicInfo, physical, health, goals } = userInfo;

  // Format health conditions for readability
  const healthConditionsText = health.conditions.length > 0 
    ? `Health Conditions: ${health.conditions.join(', ')}`
    : "No specific health conditions reported";

  const diabetesInfo = health.hasDiabetes 
    ? `Type: ${health.diabetesType || 'Not specified'}, Target Blood Sugar Range: ${health.bloodSugarRange.min || 'N/A'} - ${health.bloodSugarRange.max || 'N/A'} mg/dL`
    : "No diabetes";

  const allergiesText = health.allergies.length > 0 
    ? `Allergies: ${health.allergies.join(', ')}`
    : "No known allergies";

  const dietaryText = health.dietaryPreferences.length > 0 
    ? `Dietary Preferences: ${health.dietaryPreferences.join(', ')}`
    : "No specific dietary preferences";

  const physicalText = physical.bmi 
    ? `Weight: ${physical.weightKg}kg, Height: ${physical.heightCm}cm, BMI: ${physical.bmi} (${physical.bmi < 18.5 ? 'Underweight' : physical.bmi < 25 ? 'Healthy' : physical.bmi < 30 ? 'Overweight' : 'Obese'})`
    : `Weight: ${physical.weightKg || 'N/A'}kg, Height: ${physical.heightCm || 'N/A'}cm`;

  const activityLevelMap: Record<string, string> = {
    sedentary: "Sedentary (little to no exercise)",
    light: "Lightly active (light exercise 1-3 days/week)",
    moderate: "Moderately active (moderate exercise 3-5 days/week)",
    active: "Active (hard exercise 6-7 days/week)",
    very_active: "Very active (very hard exercise & physical job)"
  };

  const activityText = physical.activityLevel 
    ? activityLevelMap[physical.activityLevel] || physical.activityLevel
    : "Activity level not specified";

  const goalsText = goals.primaryGoal 
    ? `Primary Goal: ${goals.primaryGoal}${goals.secondaryGoals.length > 0 ? `, Secondary Goals: ${goals.secondaryGoals.join(', ')}` : ''}`
    : "No specific goals set";

  const preferencesText = [
    goals.eatingPattern && `Eating Pattern: ${goals.eatingPattern}`,
    goals.cuisinePreferences.length > 0 && `Preferred Cuisines: ${goals.cuisinePreferences.join(', ')}`,
    goals.weeklyBudget && `Weekly Budget: ${goals.weeklyBudget}`
  ].filter(Boolean).join(', ');

  return `You are a comprehensive health and wellness AI assistant. You help users with:

1. **General Health & Wellness**: Nutrition, fitness, mental health, sleep, stress management
2. **Diabetes Management** (if applicable): Blood sugar control, medication adherence, complication prevention
3. **Condition-Specific Advice**: Tailored recommendations based on user's health conditions
4. **Goal Achievement**: Supporting user's health and fitness goals
5. **Preventive Care**: Lifestyle modifications for long-term health
6. **Health Education**: Explaining medical concepts in simple terms

**User Profile Summary:**
- **Name**: ${basicInfo.name || 'Not provided'}
- **Age**: ${basicInfo.age || 'N/A'}
- **Gender**: ${basicInfo.gender || 'Not specified'}
- **Location**: ${basicInfo.location || 'Not specified'}
- **Physical Stats**: ${physicalText}
- **Activity Level**: ${activityText}
- **Diabetes Status**: ${diabetesInfo}
- **${healthConditionsText}**
- **${allergiesText}**
- **${dietaryText}**
- **Goals**: ${goalsText}
- **Preferences**: ${preferencesText || 'None specified'}

**Response Guidelines:**
1. Always personalize advice based on the user's complete profile
2. Consider age, gender, weight, height, and activity level in recommendations
3. Account for all health conditions and allergies
4. Align with user's goals (weight loss, muscle gain, maintenance, etc.)
5. Respect dietary preferences and budget constraints
6. For diabetes: emphasize glycemic control, carb counting, regular monitoring
7. For hypertension: focus on sodium reduction, DASH diet principles
8. For weight management: provide sustainable calorie and nutrition advice
9. Use metric units (kg, cm) unless user specifies otherwise
10. Be empathetic, encouraging, and evidence-based
11. Use markdown for readability (bold, bullets, sections)
12. Keep responses conversational but informative (250-400 words)
13. End with a relevant question to engage the user
14. NEVER give medical diagnoses or replace professional medical advice
15. Always suggest consulting healthcare providers for serious concerns

**Current Context**: User is chatting about health, wellness, or related topics.`;
}

export async function createConversation(userId: string): Promise<string> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    throw new Error('Failed to create conversation');
  }

  return data.id;
}

export async function getUserConversations(userId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('conversations')
    .select('id, created_at, title')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching conversations:', error);
    return [];
  }
  return data || [];
}

export async function getConversationMessages(conversationId: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
  return data || [];
}

export async function sendUserMessage(
  userId: string,
  conversationId: string,
  content: string,
  imageUrl?: string
): Promise<{ assistantResponse: string }> {
  const supabase = await createServerClient();

  // Validate conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();
  if (!conv) {
    throw new Error('Invalid conversation');
  }

  // Insert user message
  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content,
      image_url: imageUrl || null,
    });

  if (insertError) {
    console.error('Error inserting user message:', insertError);
    throw new Error('Failed to send message');
  }

  // Get enhanced user information
  const userInfo = await getEnhancedUserInfo(userId);
  if (!userInfo) {
    throw new Error('User profile not found');
  }

  // Get recent messages for context
  const recentMessages = await getConversationMessages(conversationId);
  const messageHistory: MistralChatMessage[] = recentMessages.slice(-8).map((m): MistralChatMessage => ({
    role: m.role as Role,
    content: m.content
  }));

  // Create system prompt with comprehensive user info
  const systemPrompt = createSystemPrompt(userInfo);

  const messages: MistralChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...messageHistory,
    { role: 'user', content }
  ];

  // Generate AI response
  const chatResponse = await client.chat.complete({
    model: 'mistral-medium-latest',
    messages,
    temperature: 0.7,
  });

  const assistantMessageContent = chatResponse.choices[0].message.content;
  let assistantResponse: string;
  if (typeof assistantMessageContent === 'string') {
    assistantResponse = assistantMessageContent;
  } else if (Array.isArray(assistantMessageContent)) {
    assistantResponse = assistantMessageContent
      .map((chunk: any) => {
        if (typeof chunk === 'string') {
          return chunk;
        }
        return chunk.text || (chunk as any).toString() || '';
      })
      .join('\n');
  } else {
    assistantResponse = 'I apologize, but I encountered an issue generating a response. Please try again.';
  }

  // Insert assistant response
  const { error: assistantError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantResponse,
    });

  if (assistantError) {
    console.error('Error inserting assistant message:', assistantError);
    throw new Error('Failed to generate response');
  }

  revalidatePath(`/dashboard/${conversationId}`);
  return { assistantResponse };
}

export async function sendFoodAnalysisMessage(
  userId: string,
  conversationId: string,
  userPrompt: string,
  scanOutput: ScanOutput,
  imageUrl?: string
): Promise<{ assistantResponse: string }> {
  const supabase = await createServerClient();

  // Validate conversation
  const { data: conv } = await supabase
    .from('conversations')
    .select('id')
    .eq('id', conversationId)
    .eq('user_id', userId)
    .single();
  if (!conv) {
    throw new Error('Invalid conversation');
  }

  // Insert user message
  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: `${userPrompt} [Food Analysis Attached]`,
      image_url: imageUrl || null,
    });

  if (insertError) {
    console.error('Error inserting analysis user message:', insertError);
    throw new Error('Failed to send analysis');
  }

  // Get enhanced user information
  const userInfo = await getEnhancedUserInfo(userId);
  if (!userInfo) {
    throw new Error('User profile not found');
  }

  // Create specialized system prompt for food analysis
  const baseSystemPrompt = createSystemPrompt(userInfo);
  const foodAnalysisPrompt = `${baseSystemPrompt}

**FOOD ANALYSIS MODE ACTIVATED**
You are analyzing a food image/scanned meal. Provide a comprehensive nutritional analysis considering:

1. **Personalized Nutrition Assessment**:
   - Calorie needs based on age, weight, height, activity level
   - Macronutrient distribution for user's goals (${userInfo.goals.primaryGoal || 'general health'})
   - Glycemic impact for diabetes management (if applicable)
   - Sodium content for hypertension (if applicable)
   - Allergen safety check

2. **Response Structure**:
   - **Meal Summary**: What foods were identified with confidence levels
   - **Nutritional Breakdown**: Calories, carbs, protein, fat, fiber, sugar, sodium
   - **Health Impact**: Personalized analysis based on user's complete profile
   - **Portion Guidance**: Recommended serving sizes
   - **Alternative Suggestions**: Healthier swaps aligned with preferences
   - **Meal Timing**: When to eat based on goals and conditions

3. **Special Considerations**:
   - Diabetes: Carb counting, glycemic load, insulin timing
   - Weight Goals: Calorie density, satiety factors
   - Conditions: Respect all health conditions and allergies
   - Preferences: Align with dietary and cuisine preferences
   - Budget: Consider cost-effective alternatives if provided`;

  // Prepare messages
  const scanContext = `User uploaded a food image/scan with the following analysis:
Scan Results: ${JSON.stringify(scanOutput, null, 2)}

User's specific question: "${userPrompt}"`;

  const messages: MistralChatMessage[] = [
    { role: 'system', content: foodAnalysisPrompt },
    { role: 'user', content: scanContext }
  ];

  // Generate AI response
  const chatResponse = await client.chat.complete({
    model: 'mistral-medium-latest',
    messages,
    temperature: 0.6, // Slightly lower temperature for more factual responses
  });

  const assistantMessageContent = chatResponse.choices[0].message.content;
  let assistantResponse: string;
  if (typeof assistantMessageContent === 'string') {
    assistantResponse = assistantMessageContent;
  } else if (Array.isArray(assistantMessageContent)) {
    assistantResponse = assistantMessageContent
      .map((chunk: any) => {
        if (typeof chunk === 'string') {
          return chunk;
        }
        return chunk.text || (chunk as any).toString() || '';
      })
      .join('\n');
  } else {
    assistantResponse = 'I apologize, but I encountered an issue analyzing your food. Please try again.';
  }

  // Insert assistant response
  const { error: assistantError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'assistant',
      content: assistantResponse,
    });

  if (assistantError) {
    console.error('Error inserting analysis assistant message:', assistantError);
    throw new Error('Failed to generate analysis response');
  }

  revalidatePath(`/dashboard/${conversationId}`);
  return { assistantResponse };
}