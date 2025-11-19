import { GoogleGenAI, Modality } from "@google/genai";
import { MODEL_IMAGE_EDIT, MODEL_CHAT } from '../constants';

// Initialize the client with the API key from the environment
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates or edits a room image based on the original image and a style prompt.
 * Uses gemini-2.5-flash-image (Nano Banana).
 */
export const generateRoomDesign = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    // Construct a prompt that encourages editing while keeping structural integrity
    const fullPrompt = `Keep the same room layout and perspective. Reimagine this room ${prompt}. High quality, photorealistic interior design.`;

    const response = await ai.models.generateContent({
      model: MODEL_IMAGE_EDIT,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: fullPrompt,
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    // Extract the base64 image from the response
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts && parts.length > 0) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    
    throw new Error("No image data received from Gemini.");

  } catch (error) {
    console.error("Error generating design:", error);
    throw error;
  }
};

/**
 * Sends a chat message to the AI consultant.
 * Uses gemini-3-pro-preview.
 * Includes the CURRENT visualized image (generated or original) as context.
 */
export const sendChatMessage = async (
  message: string,
  history: { role: string; text: string }[],
  contextImageBase64: string | null,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    const model = MODEL_CHAT;

    // Construct history for the model
    // We do a stateless single-turn request with context here for simplicity, 
    // or build a proper chat session. For this app, let's use generateContent
    // so we can easily inject the image every time as "current state".
    
    const parts: any[] = [];

    // 1. Add System Context/Instruction via text
    parts.push({
        text: `You are an expert Interior Design Consultant. 
        The user is showing you an image of a room (either their original room or an AI redesign).
        Answer their questions about style, furniture, color palettes, and layout.
        If they ask for shopping advice, suggest specific types of items to look for (e.g., "Look for a mid-century walnut credenza").
        Keep answers concise (under 100 words) unless asked for detail.
        Format response in Markdown.`
    });

    // 2. Add the Image Context
    if (contextImageBase64) {
        parts.push({
            inlineData: {
                data: contextImageBase64,
                mimeType: mimeType
            }
        });
    }

    // 3. Add previous chat context (last 4 messages to keep context window focused)
    const recentHistory = history.slice(-4);
    if (recentHistory.length > 0) {
        const historyText = recentHistory.map(h => `${h.role === 'user' ? 'User' : 'Consultant'}: ${h.text}`).join('\n');
        parts.push({
            text: `Previous Conversation:\n${historyText}\n`
        });
    }

    // 4. Add current user message
    parts.push({ text: `User Question: ${message}` });

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts },
      config: {
          // Standard text generation config
          temperature: 0.7
      }
    });

    return response.text || "I couldn't generate a response. Please try again.";

  } catch (error) {
    console.error("Error in chat:", error);
    throw error;
  }
};