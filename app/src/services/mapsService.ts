import { GoogleGenAI } from "@google/genai";

const apiKey =
  import.meta.env.VITE_GEMINI_API_KEY ||
  (typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : undefined);

// El SDK tira error si se construye sin key, así que solo se crea cuando hay una.
let ai: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!apiKey) return null;
  if (!ai) ai = new GoogleGenAI({ apiKey });
  return ai;
}

export interface AddressResult {
  title: string;
  uri?: string;
}

export async function searchAddresses(query: string): Promise<AddressResult[]> {
  if (!query || query.length < 3) return [];

  const client = getClient();
  if (!client) return [];

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Encuentra direcciones, lugares o puntos de referencia en Panamá que coincidan con: "${query}".`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 8.9824, // Panama City latitude
              longitude: -79.5199 // Panama City longitude
            }
          }
        }
      },
    });

    // Extract URLs from grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const results: AddressResult[] = [];
    
    for (const chunk of groundingChunks) {
      if (chunk.maps?.uri) {
        results.push({
          title: chunk.maps.title || "Dirección encontrada",
          uri: chunk.maps.uri
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error searching addresses with Gemini:", error);
    return [];
  }
}

