import mongoose from "mongoose";

const generationSchema = new mongoose.Schema(
  {
    prompt: { type: String, required: true },
    provider: { type: String, required: true },
    model: { type: String, required: true },
    imageDataUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export const Generation =
  mongoose.models.Generation || mongoose.model("Generation", generationSchema);

