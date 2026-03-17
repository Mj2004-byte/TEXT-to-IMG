import OpenAI from "openai";
import { InferenceClient } from "@huggingface/inference";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

async function generateWithHuggingFace({ apiKey, model, prompt }) {
  invariant(apiKey, "Missing HF_API_KEY");
  invariant(model, "Missing HF_IMAGE_MODEL");

  const client = new InferenceClient(apiKey);
  const imageBlob = await client.textToImage({
    model,
    inputs: prompt
  });

  const contentType = imageBlob.type || "image/png";
  const b64 = Buffer.from(await imageBlob.arrayBuffer()).toString("base64");

  return {
    provider: "huggingface",
    model,
    dataUrl: `data:${contentType};base64,${b64}`
  };
}

async function generateWithOpenAI({ apiKey, model, prompt }) {
  invariant(apiKey, "Missing OPENAI_API_KEY");
  const client = new OpenAI({ apiKey });

  const isGptImageModel = String(model).startsWith("gpt-image-");
  const res = await client.images.generate(
    isGptImageModel
      ? {
          model,
          prompt,
          size: "1024x1024",
          output_format: "png"
        }
      : {
          model,
          prompt,
          size: "1024x1024",
          response_format: "b64_json"
        }
  );

  const b64 = res?.data?.[0]?.b64_json;
  invariant(b64, "OpenAI returned no image data");

  return {
    provider: "openai",
    model,
    dataUrl: `data:image/png;base64,${b64}`
  };
}

async function generateWithMock({ prompt }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">
  <rect width="100%" height="100%" fill="#111827"/>
  <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#E5E7EB" font-family="Arial, sans-serif" font-size="34">
    Mock image
  </text>
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="22">
    ${escapeXml(prompt).slice(0, 80)}
  </text>
</svg>`;

  const b64 = Buffer.from(svg, "utf8").toString("base64");
  return {
    provider: "mock",
    model: "svg",
    dataUrl: `data:image/svg+xml;base64,${b64}`
  };
}

function escapeXml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export async function generateImage({ provider, prompt, env }) {
  if (provider === "mock") return generateWithMock({ prompt });
  if (provider === "huggingface") {
    return generateWithHuggingFace({
      apiKey: env.HF_API_KEY,
      model: env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0",
      prompt
    });
  }

  const model = env.OPENAI_IMAGE_MODEL || "gpt-image-1";
  return generateWithOpenAI({
    apiKey: env.OPENAI_API_KEY,
    model,
    prompt
  });
}

