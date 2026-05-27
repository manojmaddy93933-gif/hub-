import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Resend } from 'resend';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

let aiClient: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cors());

  // API routes
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html } = req.body;

    if (!to) {
      return res.status(400).json({ error: "Recipient 'to' is required" });
    }

    if (!resend) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      return res.status(200).json({ message: "Skipped sending email (no API key)" });
    }

    try {
      const fromEmail = process.env.FROM_EMAIL || 'onboarding@resend.dev';
      
      // Resend sandbox (onboarding@resend.dev) sometimes has issues with display names
      // or requires sending ONLY to the verified account owner email.
      const from = fromEmail === 'onboarding@resend.dev' 
        ? 'onboarding@resend.dev' 
        : `Hub Station <${fromEmail}>`;

      const { data, error } = await resend.emails.send({
        from,
        to: Array.isArray(to) ? to : [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error("Resend API Error:", JSON.stringify(error, null, 2));
        const resendError = error as any;
        return res.status(400).json({ 
          error: resendError.message || "Email validation error",
          name: resendError.name,
          details: resendError.details || "Check Resend dashboard for domain verification status. If using onboarding@resend.dev, ensure the recipient email is verified in your Resend account."
        });
      }

      res.status(200).json({ data });
    } catch (err) {
      console.error("Critical email failure:", err);
      res.status(500).json({ 
        error: "Internal server error", 
        message: err instanceof Error ? err.message : String(err) 
      });
    }
  });

  app.post("/api/gemini/tts", async (req, res) => {
    const { text, voice = 'Zephyr' } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({ audio: null, message: "GEMINI_API_KEY not set" });
    }

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voice },
            },
          },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
    } catch (error) {
      console.error("TTS Error:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  app.post("/api/verify-passcode", (req, res) => {
    const { passcode } = req.body;
    const correctPasscode = process.env.ADMIN_PASSCODE || "admin123";

    if (passcode === correctPasscode) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ success: false, message: "Invalid passcode" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
