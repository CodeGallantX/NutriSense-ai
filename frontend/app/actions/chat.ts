'use server';

import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { revalidatePath } from 'next/cache';
import { ScanOutput } from './analyze-food'; // Reuse from previous
import { Profile } from '@/types/database';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export type UserConditions = {
  hasDiabetes: boolean;
  hypertension: boolean; 
  ulcer: boolean;
  weight_loss: boolean;
};

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

export async function getOrCreateConversation(userId: string): Promise<string> {
  const supabase = createServerClient();
  
  // Check for existing conversation
  const { data: existing } = await (await supabase)
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  const { data, error } = await (await supabase)
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
  return data;
}

export async function sendUserMessage(
  userId: string,
  content: string,
  imageUrl?: string
): Promise<{ conversationId: string; assistantResponse: string }> {
  const supabase = await createServerClient();
  const conversationId = await getOrCreateConversation(userId);

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

  // Generate assistant response (general chat)
  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const userConditions: UserConditions = {
    hasDiabetes: profile.has_diabetes,
    hypertension: profile.health_conditions?.includes('hypertension') || false,
    ulcer: profile.health_conditions?.includes('ulcer') || false,
    weight_loss: profile.primary_goal === 'weight_loss' || (profile.secondary_goals || []).includes('weight_loss'),
  };

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  const systemPrompt = `You are an empathetic diabetes health assistant. Respond conversationally to user queries about nutrition, diabetes management, meals, etc. Personalize based on user conditions: diabetes (low-GI, portion control), hypertension (low-sodium), ulcer (bland), weight loss (calorie control). Keep positive, under 200 words, use markdown. End with a question.`;

  // For general chat, fetch recent messages for context
  const recentMessages = await getConversationMessages(conversationId);
  const messageHistory = recentMessages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n');

  const fullPrompt = `${systemPrompt}\n\nRecent Chat History:\n${messageHistory}\n\nUser: ${content}\n\nUser Conditions: ${JSON.stringify(userConditions)}`;

  const result = await model.generateContent(fullPrompt);
  const assistantResponse = await result.response.text();

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

  revalidatePath('/dashboard'); // Revalidate for client fetch
  return { conversationId, assistantResponse };
}

export async function sendFoodAnalysisMessage(
  userId: string,
  userPrompt: string,
  scanOutput: ScanOutput,
  imageUrl?: string // If stored in Supabase Storage
): Promise<{ conversationId: string; assistantResponse: string }> {
  // Reuse logic from analyzeFood, but integrate with chat
  const conversationId = await getOrCreateConversation(userId);

  // Insert user message with prompt and image
  const supabase = await createServerClient();
  const { error: insertError } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      role: 'user',
      content: `${userPrompt} [Food Image Attached]`,
      image_url: imageUrl || null,
    });

  if (insertError) {
    console.error('Error inserting analysis user message:', insertError);
    throw new Error('Failed to send analysis');
  }

  const profile = await getUserProfile(userId);
  if (!profile) {
    throw new Error('Profile not found');
  }

  const userConditions: UserConditions = {
    hasDiabetes: profile.has_diabetes,
    hypertension: profile.health_conditions?.includes('hypertension') || false,
    ulcer: profile.health_conditions?.includes('ulcer') || false,
    weight_loss: profile.primary_goal === 'weight_loss' || (profile.secondary_goals || []).includes('weight_loss'),
  };

  // Generate AI response (from previous analyzeFood logic)
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' });
  const systemPrompt = `You are an empathetic diabetes health assistant. Generate a helpful, conversational response based on the food scan output. Focus on diabetes management if the user has diabetes (emphasize low-GI foods, portion control, balanced macros). Consider other conditions like hypertension (low-sodium suggestions), ulcers (bland foods), weight loss (calorie control). Structure the response with:
- **Identified Foods**: List detected items with confidence.
- **Nutritional Breakdown**: Key macros, calories, GI.
- **Health Impact**: Personalized analysis based on conditions.
- **Recommendations**: Actionable tips, alternatives.

Keep it positive, encouraging, under 300 words. Use markdown for formatting (bold, bullets). End with a question to continue the conversation.`;

  const fullPrompt = `${systemPrompt}\n\nScan Output: ${JSON.stringify(scanOutput, null, 2)}\n\nUser Prompt: ${userPrompt}\n\nUser Conditions: ${JSON.stringify(userConditions)}`;

  const result = await model.generateContent(fullPrompt);
  const assistantResponse = await result.response.text();

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

  revalidatePath('/dashboard');
  return { conversationId, assistantResponse };
}