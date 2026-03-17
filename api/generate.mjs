import { json, readJson } from "./_lib/http.mjs";
import { getDb } from "./_lib/db.mjs";
import { Generation } from "./_lib/models.mjs";
import { generateImage } from "./_lib/imageProvider.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });

  try {
    const body = await readJson(req);
    const prompt = String(body?.prompt || "").trim();
    if (!prompt) return json(res, 400, { error: "Prompt is required" });
    if (prompt.length > 800) return json(res, 400, { error: "Prompt too long" });

    const image = await generateImage({ prompt });

    const conn = await getDb();
    const generation = conn
      ? await Generation.create({
          prompt,
          provider: image.provider,
          model: image.model,
          imageDataUrl: image.dataUrl
        })
      : null;

    return json(res, 200, { image, generation });
  } catch (err) {
    const statusCode = err?.statusCode || 500;
    return json(res, statusCode, { error: err?.message || "Server error" });
  }
}

