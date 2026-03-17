import { Router } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Generation } from "../models/Generation.js";
import { generateImage } from "../services/imageProvider.js";

const router = Router();

router.get("/generations", async (_req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ generations: [] });
    }
    const generations = await Generation.find({})
      .sort({ createdAt: -1 })
      .limit(25)
      .lean();
    res.json({ generations });
  } catch (err) {
    next(err);
  }
});

router.post("/generate", async (req, res, next) => {
  try {
    const body = z
      .object({
        prompt: z.string().min(1).max(800)
      })
      .parse(req.body);

    const provider = process.env.IMAGE_PROVIDER || "openai";
    const image = await generateImage({
      provider,
      prompt: body.prompt,
      env: process.env
    });

    const generation =
      mongoose.connection.readyState === 1
        ? await Generation.create({
            prompt: body.prompt,
            provider: image.provider,
            model: image.model,
            imageDataUrl: image.dataUrl
          })
        : null;

    res.json({
      image,
      generation
    });
  } catch (err) {
    next(err);
  }
});

export default router;

