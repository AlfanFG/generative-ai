import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { GoogleGenAI } from "@google/genai";

function extractText(data) {
  try {
    const text =
      data?.response?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.candidates?.[0]?.content?.parts?.[0]?.text ??
      data?.response?.candidates?.[0]?.content?.text;

    return text ?? JSON.stringify(data, null, 2);
  } catch (err) {
    console.error("Error extracting text", err);
    return JSON.stringify(data, null, 2);
  }
}

// declare variable untuk express
const app = express();
// declare variable untuk multer
const upload = multer();

// declare variable untuk Google Gemini AI model
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_PORT = 3000;
// instantiation --> memanggil class menjadi sebuah instance

// tambah routing untuk handle model-nya
// app.post('/', (req, res) => {})
const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
});

app.use(express.json());

app.post("/generate-text", async (req, res) => {
  try {
    const prompt = req.body?.prompt;
    if (!prompt) {
      res.status(400).json({ message: "Belum ada prompt diisi!" });
      return;
    }
    const aiResponse = await ai.models.generateContent({
      model: DEFAULT_GEMINI_MODEL,
      contents: prompt,
    });

    res.json({ result: extractText(aiResponse) });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

app.post(
  "/generate-text-from-image",
  upload.single("image"),
  async (req, res) => {
    try {
      const prompt = req.body?.prompt;
      if (!prompt) {
        res.status(400).json({ message: "Belum ada prompt diisi!" });
        return;
      }
      const file = req.file;
      if (!file) {
        res.status(400).json({ message: "File 'image' harus di upload!" });
        return;
      }
      const imgBase64 = file.buffer.toString("base64");
      const aiResponse = await ai.models.generateContent({
        model: DEFAULT_GEMINI_MODEL,
        contents: [
          {
            text: prompt,
          },
          {
            inlineData: {
              mimeType: file.mimetype,
              data: imgBase64,
            },
          },
        ],
      });

      res.json({
        result: extractText(aiResponse),
      });
    } catch (err) {
      res.status(500).json({
        message: err.message,
      });
    }
  }
);

// memanggil middleware untuk bisa terima header
// dengan Content Type application/json

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ready on http://localhost:${PORT}`);
});
