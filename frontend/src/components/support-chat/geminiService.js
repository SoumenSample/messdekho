/**
 * Gemini Service
 * Handles all AI communication with Google's Gemini API
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn(
    "VITE_GEMINI_API_KEY not set. AI chat will not work. Add it to .env.local"
  );
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

/**
 * Send a message to Gemini and get a response
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} - AI response
 */
export async function getAIResponse(message, conversationHistory = []) {
  if (!genAI) {
    return "AI is currently unavailable. Please try again later.";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Build conversation history for context
    let contents = [];

    // Add previous messages (last 10 for context)
    const recentHistory = conversationHistory.slice(-10);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.from === "me" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }

    // Add current message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    // System context about MessDekho
    const systemPrompt =
      "You are Priya, an AI Support Assistant for MessDekho, a premium PG (paying guest) accommodation platform in India. You help users with: 1. Finding PGs in different cities (Mumbai, Pune, Delhi, Chennai, Hyderabad, Ahmedabad, Bengaluru, Lucknow) 2. Booking information and assistance 3. General questions about available accommodations 4. Payment and cancellation policies 5. Customer support queries. Be helpful, friendly, concise, and professional. Keep responses under 300 characters when possible. Always maintain the MessDekho brand voice - premium, modern, and user-focused.";

    const response = await model.generateContent({
      contents: contents,
      systemInstruction: systemPrompt,
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.7,
      },
    });

    const aiMessage =
      response.response.text() ||
      "I couldn't generate a response. Please try again.";
    return aiMessage;
  } catch (error) {
    console.error("Gemini API Error:", error);

    if (error.status === 401) {
      return "Authentication failed. Please check your API key configuration.";
    }
    if (error.status === 429) {
      return "I'm getting a lot of requests right now. Please try again in a moment.";
    }

    return "Sorry, I encountered an error. Please try again later.";
  }
}

export default { getAIResponse };
