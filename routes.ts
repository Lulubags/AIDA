import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { generateCAPSResponse, generateQuickResponse } from "./openai";
import { insertSessionSchema, insertMessageSchema, insertCurriculumDocumentSchema } from "@shared/schema";
import { PayFastService } from "./payfast";
import { defaultPlans, payfastNotificationSchema } from "../shared/payfast-schema";
import { z } from "zod";

const chatRequestSchema = z.object({
  message: z.string(),
  sessionId: z.string(),
  grade: z.number().min(1).max(12),
  subject: z.string(),
  mediaType: z.string().nullable().optional(),
  mediaUrl: z.string().nullable().optional(),
  mediaThumbnail: z.string().nullable().optional(),
});

const sessionRequestSchema = z.object({
  grade: z.number().min(1).max(12),
  subject: z.string(),
});

const quickActionSchema = z.object({
  type: z.enum(['example', 'simpler', 'test']),
  sessionId: z.string(),
  lastTopic: z.string(),
  grade: z.number().min(1).max(12),
  subject: z.string(),
});

// Initialize PayFast service
const payfast = new PayFastService({
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passPhrase: process.env.PAYFAST_PASSPHRASE || '',
  sandbox: process.env.NODE_ENV !== 'production'
});

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
const curriculumDir = path.join(uploadDir, 'curriculum');
const mediaDir = path.join(uploadDir, 'media');

// Ensure all upload directories exist
[uploadDir, curriculumDir, mediaDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for curriculum uploads
const curriculumUpload = multer({
  dest: path.join(uploadDir, 'curriculum'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

// Configure multer for media uploads (images, videos)
const mediaUpload = multer({
  dest: path.join(uploadDir, 'media'),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
  },
});

// Simple text extraction function (in production, you'd use proper libraries)
function extractTextFromFile(filePath: string, mimeType: string): string {
  try {
    if (mimeType === 'text/plain') {
      return fs.readFileSync(filePath, 'utf-8');
    }
    // For other file types, return a placeholder - in production you'd use libraries like pdf-parse, mammoth, etc.
    return `[Content extracted from ${path.basename(filePath)} - implement proper text extraction for ${mimeType}]`;
  } catch (error) {
    console.error('Error extracting text:', error);
    return '[Error extracting text content]';
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Create or get session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { grade, subject } = sessionRequestSchema.parse(req.body);
      
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = await storage.createSession({
        sessionId,
        currentGrade: grade,
        currentSubject: subject,
        questionsAsked: 0,
        studyTimeMinutes: 0,
      });

      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ error: "Failed to create session" });
    }
  });

  // Get session by ID
  app.get("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ error: "Failed to fetch session" });
    }
  });

  // Update session (grade/subject change)
  app.patch("/api/sessions/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const updates = req.body;
      
      const session = await storage.updateSession(sessionId, updates);
      
      if (!session) {
        return res.status(404).json({ error: "Session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Failed to update session" });
    }
  });

  // Get chat history
  app.get("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getMessages(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Send chat message
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, sessionId, grade, subject, mediaType, mediaUrl, mediaThumbnail } = chatRequestSchema.parse(req.body);

      // Store user message with media
      await storage.createMessage({
        sessionId,
        content: message || (mediaType ? `[${mediaType} content shared]` : ''),
        role: 'user',
        grade,
        subject,
        mediaType: mediaType || undefined,
        mediaUrl: mediaUrl || undefined,
        mediaThumbnail: mediaThumbnail || undefined,
      });

      // Get chat history for context
      const messages = await storage.getMessages(sessionId);
      const chatHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Generate AI response (with image analysis if image was provided)
      let aiResponse: string;
      if (mediaType === 'image' && mediaUrl) {
        // For image content, convert local URL to full URL for OpenAI
        const fullImageUrl = mediaUrl.startsWith('http') 
          ? mediaUrl 
          : `http://localhost:5000${mediaUrl}`;
        
        const enhancedMessage = message 
          ? `${message} [User shared an image for analysis]`
          : `Please analyze this image and help me understand it in the context of Grade ${grade} ${subject}.`;
        
        aiResponse = await generateCAPSResponse(enhancedMessage, grade, subject, chatHistory, fullImageUrl);
      } else {
        aiResponse = await generateCAPSResponse(message || 'Please help me with this content.', grade, subject, chatHistory);
      }

      // Store AI response
      const assistantMessage = await storage.createMessage({
        sessionId,
        content: aiResponse,
        role: 'assistant',
        grade,
        subject,
      });

      // Update session stats
      await storage.incrementQuestionCount(sessionId);
      await storage.updateStudyTime(sessionId, 2); // Assume 2 minutes per interaction

      res.json({
        message: assistantMessage,
        response: aiResponse,
      });
    } catch (error) {
      console.error("Error processing chat message:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Quick action responses
  app.post("/api/quick-action", async (req, res) => {
    try {
      const { type, sessionId, lastTopic, grade, subject } = quickActionSchema.parse(req.body);

      const response = await generateQuickResponse(type, lastTopic, grade, subject);

      // Store the quick action response
      await storage.createMessage({
        sessionId,
        content: response,
        role: 'assistant',
        grade,
        subject,
      });

      res.json({ response });
    } catch (error) {
      console.error("Error processing quick action:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to process quick action" });
    }
  });

  // Upload curriculum documents
  app.post("/api/curriculum/upload", curriculumUpload.array('files', 10), async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const { grade, subject, description } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      if (!grade || !subject) {
        return res.status(400).json({ error: "Grade and subject are required" });
      }

      const documents = [];

      for (const file of files) {
        // Extract text content from the file
        const textContent = extractTextFromFile(file.path, file.mimetype);

        // Create curriculum document record
        const document = await storage.createCurriculumDocument({
          fileName: file.filename,
          originalName: file.originalname,
          fileType: file.mimetype,
          fileSize: file.size,
          grade: parseInt(grade),
          subject: subject,
          description: description || null,
          content: textContent,
          isActive: 1,
        });

        documents.push({
          id: document.id.toString(),
          name: document.originalName,
          type: document.fileType,
          size: document.fileSize,
          grade: document.grade,
          subject: document.subject,
        });
      }

      res.json({ documents, message: `Successfully uploaded ${documents.length} curriculum document(s)` });
    } catch (error) {
      console.error("Error uploading curriculum documents:", error);
      res.status(500).json({ error: "Failed to upload curriculum documents" });
    }
  });

  // Get curriculum documents
  app.get("/api/curriculum", async (req, res) => {
    try {
      const { grade, subject } = req.query;

      let documents;
      if (grade && subject) {
        documents = await storage.getCurriculumDocuments(parseInt(grade as string), subject as string);
      } else {
        documents = await storage.getAllCurriculumDocuments();
      }

      res.json(documents);
    } catch (error) {
      console.error("Error fetching curriculum documents:", error);
      res.status(500).json({ error: "Failed to fetch curriculum documents" });
    }
  });

  // Delete curriculum document
  app.delete("/api/curriculum/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCurriculumDocument(parseInt(id));

      if (success) {
        res.json({ message: "Document deleted successfully" });
      } else {
        res.status(404).json({ error: "Document not found" });
      }
    } catch (error) {
      console.error("Error deleting curriculum document:", error);
      res.status(500).json({ error: "Failed to delete curriculum document" });
    }
  });

  // Upload media files (images, videos)
  app.post("/api/media/upload", mediaUpload.single('media'), async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: "No media file uploaded" });
      }

      // Return the file URL that can be accessed by the frontend
      const fileUrl = `/uploads/media/${file.filename}`;
      
      res.json({ 
        url: fileUrl,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size
      });
    } catch (error) {
      console.error("Error uploading media:", error);
      res.status(500).json({ error: "Failed to upload media file" });
    }
  });

  // Get subscription plans
  app.get("/api/subscription/plans", (req, res) => {
    res.json(defaultPlans);
  });

  // Create subscription payment
  app.post("/api/subscription/create-payment", async (req, res) => {
    try {
      const { planId, userDetails } = req.body;
      
      const plan = defaultPlans.find(p => p.id === planId);
      if (!plan) {
        return res.status(404).json({ error: "Plan not found" });
      }

      const paymentData = payfast.generateSubscriptionPayment(
        userDetails,
        {
          name: plan.name,
          description: `${plan.name} - Aida AI Tutor Subscription`,
          amount: plan.price,
          frequency: plan.interval === 'monthly' ? 'monthly' : 'yearly'
        },
        { planId, userId: userDetails.userId }
      );

      const paymentForm = payfast.generatePaymentForm(paymentData);
      
      res.json({
        paymentData,
        paymentForm,
        paymentUrl: process.env.NODE_ENV === 'production' 
          ? 'https://www.payfast.co.za/eng/process'
          : 'https://sandbox.payfast.co.za/eng/process'
      });
    } catch (error) {
      console.error("Error creating subscription payment:", error);
      res.status(500).json({ error: "Failed to create subscription payment" });
    }
  });

  // PayFast webhook notification
  app.post("/api/payfast/notify", express.raw({ type: 'application/x-www-form-urlencoded' }), async (req, res) => {
    try {
      const notification = payfastNotificationSchema.parse(req.body);
      
      // Verify PayFast signature
      const isValid = payfast.verifySignature(notification);
      if (!isValid) {
        console.error("Invalid PayFast signature");
        return res.status(400).send("Invalid signature");
      }

      // Process payment notification
      if (notification.payment_status === "COMPLETE") {
        // Handle successful payment
        console.log("Payment completed:", notification);
        // Here you would update user subscription status in your database
      }

      res.status(200).send("OK");
    } catch (error) {
      console.error("Error processing PayFast notification:", error);
      res.status(500).send("Error processing notification");
    }
  });

  // Subscription success page
  app.get("/subscription/success", (req, res) => {
    res.send(`
      <html>
        <head><title>Subscription Success - Aida AI Tutor</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>🎉 Welcome to Aida AI Tutor!</h1>
          <p>Your subscription has been activated successfully.</p>
          <p>You can now close this window and start learning with Aida!</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  });

  // Subscription cancelled page
  app.get("/subscription/cancelled", (req, res) => {
    res.send(`
      <html>
        <head><title>Subscription Cancelled - Aida AI Tutor</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h1>Subscription Cancelled</h1>
          <p>Your subscription was not completed.</p>
          <p>You can try again anytime by visiting our pricing page.</p>
          <script>
            setTimeout(() => window.close(), 3000);
          </script>
        </body>
      </html>
    `);
  });

  // Serve uploaded files
  const staticPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', (req: any, res: any, next: any) => {
    const filePath = path.join(staticPath, req.path);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
