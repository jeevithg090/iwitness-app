import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { ANALYSIS_PROMPT, parseAnalysis, splitDataUrl } from "@/lib/analysis";
import { jsonError, parseJsonBody, tooManyRequests } from "@/lib/http";
import { clientKey, createRateLimiter } from "@/lib/rate-limit";
import { analyzeImageSchema } from "@/lib/validation";

const limiter = createRateLimiter({ limit: 10, windowMs: 10 * 60 * 1000 });

/** POST /api/analyze-image: drafts title/category/description from a photo. */
export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonError(
      503,
      "Photo analysis is not configured. Please fill in the details.",
    );
  }

  const rate = limiter(clientKey(request, "analyze-image"));
  if (!rate.ok) return tooManyRequests(rate);

  const body = await parseJsonBody(request, analyzeImageSchema, 5_000_000);
  if (!body.ok) return body.response;

  const parts = splitDataUrl(body.data.image);
  if (!parts) return jsonError(422, "Image must be a base64 data URL");

  try {
    const ai = new GoogleGenAI({ apiKey });
    const result = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: ANALYSIS_PROMPT }, { inlineData: parts }],
        },
      ],
    });

    const analysis = parseAnalysis(result.text ?? "");
    if (!analysis) {
      return jsonError(
        502,
        "Could not understand the photo. Please fill in the details.",
      );
    }
    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Image analysis failed:", error);
    return jsonError(502, "Photo analysis failed. Please fill in the details manually.");
  }
}
