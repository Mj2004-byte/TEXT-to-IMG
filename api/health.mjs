import { json } from "./_lib/http.mjs";

export default async function handler(_req, res) {
  return json(res, 200, { ok: true });
}

