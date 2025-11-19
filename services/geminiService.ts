
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { StoryData } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const parseStoryFromText = async (rawText: string): Promise<StoryData> => {
  const ai = getClient();
  
  const prompt = `
    You are a master storyteller and children's book editor. 
    Transform the following personal narrative into a structured storybook.
    Split the narrative into 5 to 8 distinct chapters (pages).
    For each chapter, provide:
    1. A whimsical, very short title (maximum 4 words).
    2. The story text for that page (edited slightly for flow and tone, keeping the first-person perspective).
    3. A detailed visual prompt for an AI image generator to illustrate this specific scene. The visual style should be "warm, watercolor, storybook illustration".
    
    Also provide a main title for the whole book.
    
    Here is the raw text:
    "${rawText}"
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          chapters: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                visualPrompt: { type: Type.STRING }
              },
              required: ["title", "content", "visualPrompt"]
            }
          }
        },
        required: ["title", "chapters"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as StoryData;
};

export const generatePageImage = async (visualPrompt: string): Promise<string | null> => {
  const ai = getClient();
  
  try {
    // Using gemini-2.5-flash-image (Nano Banana) as requested for general image generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: visualPrompt + ", highly detailed, watercolor style, storybook illustration, warm lighting, no text in image" }
        ]
      },
      config: {
        responseModalities: [Modality.IMAGE]
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.[0];
    if (part && part.inlineData && part.inlineData.data) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch (e) {
    console.error("Image generation failed", e);
    return null;
  }
};

export const generatePageAudio = async (text: string): Promise<string | null> => {
  const ai = getClient();
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }, // Gentle, feminine voice often good for stories
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (e) {
    console.error("Audio generation failed", e);
    return null;
  }
};
