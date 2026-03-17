import { InferenceClient } from "@huggingface/inference";

function invariant(condition, message) {
  if (!condition) throw new Error(message);
}

export async function generateImage({ prompt }) {
  const apiKey = process.env.HF_API_KEY;
  const model =
    process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

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

