import { json } from "./_lib/http.mjs";
import { getDb } from "./_lib/db.mjs";
import { Generation } from "./_lib/models.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });

  try {
    const conn = await getDb();
    if (!conn) return json(res, 200, { generations: [] });

    const generations = await Generation.find({})
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();

    return json(res, 200, { generations });
  } catch (err) {
    return json(res, 500, { error: err?.message || "Server error" });
  }
}

