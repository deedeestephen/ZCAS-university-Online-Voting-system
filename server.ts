import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import path from "path";
import * as dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

let twilioClient: twilio.Twilio | null = null;
function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (accountSid && authToken) {
      twilioClient = twilio(accountSid, authToken);
    }
  }
  return twilioClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));

  app.post('/api/sms/notify-verification', async (req, res) => {
    try {
      const client = getTwilioClient();
      if (!client) {
        return res.status(500).json({ error: "Twilio is not configured." });
      }
      
      const { phoneNumber, status, studentName } = req.body;
      if (!phoneNumber || !status) {
         return res.status(400).json({ error: "Missing required fields." });
      }

      let messageBody = "";
      if (status === 'approved') {
         messageBody = `Hello ${studentName || 'Student'}, your verification for the election has been APPROVED. You can now cast your vote.`;
      } else {
         messageBody = `Hello ${studentName || 'Student'}, your verification for the election has been REJECTED. Please contact administration.`;
      }

      await client.messages.create({
        body: messageBody,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      res.json({ success: true });
    } catch (e: any) {
      console.error("Error sending SMS:", e);
      res.status(500).json({ error: e.message || "Failed to send SMS" });
    }
  });

  app.post('/api/sms/notify-election-start', async (req, res) => {
    try {
      const client = getTwilioClient();
      if (!client) {
        return res.status(500).json({ error: "Twilio is not configured." });
      }
      
      const { phoneNumbers, startTime, endTime } = req.body;
      if (!phoneNumbers || !Array.isArray(phoneNumbers)) {
         return res.status(400).json({ error: "Missing phone numbers array." });
      }

      const messageBody = `The Election has officially started! Voting is open from ${new Date(startTime).toLocaleString()} to ${new Date(endTime).toLocaleString()}. Log in to cast your vote!`;

      const results = [];
      for (const number of phoneNumbers) {
        try {
           if (number) {
             const result = await client.messages.create({
               body: messageBody,
               from: process.env.TWILIO_PHONE_NUMBER,
               to: number,
             });
             results.push({ to: number, status: 'success', sid: result.sid });
           }
        } catch(smsErr: any) {
           results.push({ to: number, status: 'error', error: smsErr.message });
        }
      }
      res.json({ success: true, results });
    } catch (e: any) {
      console.error("Error sending bulk SMS:", e);
      res.status(500).json({ error: e.message || "Failed to send bulk SMS" });
    }
  });

  // Vite middleware setup
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
