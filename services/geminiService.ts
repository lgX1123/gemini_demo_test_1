import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { MapLocation } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface GenerateResponse {
  text: string;
  locations: MapLocation[];
  groundingChunks?: any[];
}

export const sendMessageToGemini = async (
  message: string,
  userLocation: { lat: number; lng: number } | null,
  history: { role: string; parts: { text: string }[] }[] = []
): Promise<GenerateResponse> => {
  if (!apiKey) {
    throw new Error("API Key not found. Please set REACT_APP_GEMINI_API_KEY or allow the app to use the provided key.");
  }

  const modelId = 'gemini-2.5-flash';

  const tools = [
    { googleMaps: {} },
    { googleSearch: {} }
  ];

  const toolConfig = userLocation
    ? {
        retrievalConfig: {
          latLng: {
            latitude: userLocation.lat,
            longitude: userLocation.lng,
          },
        },
      }
    : undefined;

  try {
    const chat = ai.chats.create({
      model: modelId,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: tools,
        toolConfig: toolConfig,
      },
      history: history,
    });

    const result = await chat.sendMessage({ message });
    let responseText = result.text || "";
    
    // Parse out the JSON block for locations
    const locations: MapLocation[] = [];
    
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonBlockRegex);
    
    if (match && match[1]) {
        try {
            const parsedLocations = JSON.parse(match[1]);
            if (Array.isArray(parsedLocations)) {
                parsedLocations.forEach((loc: any) => {
                    if (typeof loc.lat === 'number' && typeof loc.lng === 'number') {
                        locations.push({
                            lat: loc.lat,
                            lng: loc.lng,
                            title: loc.title || 'Unknown Location',
                            address: loc.description
                        });
                    }
                });
            }
            // Remove the JSON block from the text displayed to the user for cleanliness
            responseText = responseText.replace(jsonBlockRegex, '').trim();
        } catch (e) {
            console.warn("Failed to parse location JSON from model response", e);
        }
    }
    
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return {
      text: responseText,
      locations: locations,
      groundingChunks: groundingChunks
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
