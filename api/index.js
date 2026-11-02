import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import connectToDatabase from './db.js';
import EmployeeCard from './models/EmployeeCard.js';

dotenv.config();

const app = express();

// In-memory fallback store when MongoDB is not connected
let inMemoryEmployees = [];

// Middleware
app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const DEFAULT_GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const db = await connectToDatabase();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongoConnected: !!db,
    geminiKeyConfigured: !!(process.env.GEMINI_API_KEY || DEFAULT_GEMINI_API_KEY),
    service: 'metamorphosis-id-generator-api',
  });
});

/**
 * POST /api/process-photo
 * AI Studio Pure-White Background Processor via Gemini "Nano Banana" (gemini-2.5-flash-image)
 */
app.post('/api/process-photo', async (req, res) => {
  try {
    const { imageBase64, customApiKey } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'imageBase64 is required.' });
    }

    const apiKey = (customApiKey && customApiKey.trim()) || DEFAULT_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        error: 'No Gemini API Key provided. Please set GEMINI_API_KEY or enter your key in Settings.',
      });
    }

    // Clean base64 string and extract mimeType
    let mimeType = 'image/jpeg';
    let rawBase64 = imageBase64;

    const dataUriMatch = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
    if (dataUriMatch) {
      mimeType = dataUriMatch[1];
      rawBase64 = dataUriMatch[2];
    }

    const masterPassportPrompt =
      "Edit this image to replace the entire background with a solid, flat, pure studio white (#FFFFFF) background suitable for an official passport or corporate ID card photo. Strictly preserve the human subject 100% unchanged: do NOT alter the person's face, facial features, skin tone, hair strands, posture, clothing, or lighting. Only remove the environment behind the person and fill the background with pure #FFFFFF white with clean, sharp edge cutouts around the hair and shoulders.";

    console.log(`[POST /api/process-photo] Processing photo with Gemini (mime: ${mimeType}, size: ${Math.round(rawBase64.length / 1024)} KB)...`);

    const ai = new GoogleGenAI({ apiKey });

    let processedImageBase64 = null;
    let providerUsed = 'gemini-2.5-flash-image';
    let errorMessage = null;

    try {
      // Primary: Call gemini-2.5-flash-image with image, master prompt, and responseModalities
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: rawBase64,
                },
              },
              {
                text: masterPassportPrompt,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      // Check if image data was returned in candidate content parts
      const candidates = geminiResponse?.candidates || [];
      for (const cand of candidates) {
        const parts = cand?.content?.parts || [];
        for (const part of parts) {
          if (part.inlineData?.data) {
            processedImageBase64 = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
            break;
          }
        }
        if (processedImageBase64) break;
      }

      // If output_image helper exists on SDK response:
      if (!processedImageBase64 && geminiResponse?.output_image?.data) {
        processedImageBase64 = `data:${geminiResponse.output_image.mime_type || 'image/png'};base64,${geminiResponse.output_image.data}`;
      }
    } catch (geminiError) {
      console.warn(`[Gemini API] Call error: ${geminiError.message}`);
      errorMessage = geminiError.message;
    }

    // If Gemini image model succeeded:
    if (processedImageBase64) {
      return res.json({
        success: true,
        processedImage: processedImageBase64,
        provider: providerUsed,
        message: 'Background replaced with pure studio white via Gemini Nano Banana AI!',
      });
    }

    // Gemini was unable to return an image (e.g. 429 quota, rate-limit, or model status):
    // Instruct frontend to seamlessly run the real client-side AI segmentation engine (@imgly/background-removal)
    return res.json({
      success: false,
      fallbackRequired: true,
      provider: 'client-ai-imgly',
      error: errorMessage || 'Gemini did not return an image part.',
      message: 'Gemini quota reached or unavailable. Running client-side AI background segmentation engine...',
    });
  } catch (error) {
    console.error('[POST /api/process-photo] Unhandled error:', error);
    res.status(500).json({
      error: 'Failed to process photo',
      details: error.message,
    });
  }
});

/**
 * GET /api/employees
 * List all saved employee cards
 */
app.get('/api/employees', async (req, res) => {
  try {
    const db = await connectToDatabase();
    if (db) {
      const cards = await EmployeeCard.find().sort({ createdAt: -1 }).limit(50);
      return res.json({
        success: true,
        source: 'mongodb',
        count: cards.length,
        employees: cards,
      });
    }

    // Fallback to in-memory store
    res.json({
      success: true,
      source: 'memory',
      count: inMemoryEmployees.length,
      employees: inMemoryEmployees,
    });
  } catch (error) {
    console.error('[GET /api/employees] Error:', error);
    res.json({
      success: true,
      source: 'memory-fallback',
      count: inMemoryEmployees.length,
      employees: inMemoryEmployees,
    });
  }
});

/**
 * POST /api/employees
 * Save employee card
 */
app.post('/api/employees', async (req, res) => {
  try {
    const {
      name,
      designation,
      nid,
      bloodGroup,
      phone,
      photoBase64,
      originalPhotoBase64,
      photoScale,
      photoOffsetX,
      photoOffsetY,
      useAiPhoto,
    } = req.body;

    if (!name || !designation || !nid || !bloodGroup || !phone || !photoBase64) {
      return res.status(400).json({
        error: 'Missing required employee fields: name, designation, nid, bloodGroup, phone, photoBase64',
      });
    }

    const cardData = {
      name: name.trim(),
      designation: designation.trim(),
      nid: nid.trim(),
      bloodGroup: bloodGroup.trim(),
      phone: phone.trim(),
      photoBase64,
      originalPhotoBase64: originalPhotoBase64 || '',
      photoScale: typeof photoScale === 'number' ? photoScale : 1,
      photoOffsetX: typeof photoOffsetX === 'number' ? photoOffsetX : 0,
      photoOffsetY: typeof photoOffsetY === 'number' ? photoOffsetY : 0,
      useAiPhoto: useAiPhoto !== false,
      createdAt: new Date(),
    };

    const db = await connectToDatabase();
    if (db) {
      const newCard = await EmployeeCard.create(cardData);
      return res.status(201).json({
        success: true,
        source: 'mongodb',
        employee: newCard,
      });
    }

    // Save to in-memory store if MongoDB is not configured
    const simulatedCard = {
      _id: 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      ...cardData,
    };
    inMemoryEmployees.unshift(simulatedCard);

    res.status(201).json({
      success: true,
      source: 'memory',
      employee: simulatedCard,
      message: 'Saved to session memory (Configure MONGODB_URI in .env for persistent database storage).',
    });
  } catch (error) {
    console.error('[POST /api/employees] Error:', error);
    res.status(500).json({
      error: 'Failed to save employee card',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/employees/:id
 * Delete employee card
 */
app.delete('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const db = await connectToDatabase();

    if (db) {
      const deleted = await EmployeeCard.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Employee card not found.' });
      }
      return res.json({ success: true, message: 'Employee card deleted from MongoDB.' });
    }

    // In-memory deletion
    const initialLen = inMemoryEmployees.length;
    inMemoryEmployees = inMemoryEmployees.filter((e) => e._id !== id);
    if (inMemoryEmployees.length === initialLen) {
      return res.status(404).json({ error: 'Employee card not found in memory.' });
    }

    res.json({ success: true, message: 'Employee card deleted from memory.' });
  } catch (error) {
    console.error('[DELETE /api/employees/:id] Error:', error);
    res.status(500).json({ error: 'Failed to delete employee card', details: error.message });
  }
});

// Vercel Serverless Function export:
export default app;
