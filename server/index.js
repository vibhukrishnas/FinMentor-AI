import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ──────────────────────────────────────────
// 1. Life Event Financial Advisor (Gemini)
// ──────────────────────────────────────────
app.post('/api/life-events', async (req, res) => {
  try {
    const { eventType, income, age } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `You are an elite Indian financial advisor. 
    The user is ${age} years old, earns ${income} INR annually. 
    They just had a life event: "${eventType}".
    
    Generate 3 highly specific financial action items for them regarding tax, insurance, or investments. 
    Return ONLY valid JSON in this exact format, with no markdown code blocks around it:
    {
      "tasks": [
        { "step": 1, "title": "...", "description": "..." },
        { "step": 2, "title": "...", "description": "..." },
        { "step": 3, "title": "...", "description": "..." }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleanJsonStr);
    res.json(json);

  } catch (error) {
    console.error("Life Events AI Error:", error.message);
    res.status(500).json({ error: "Failed to generate AI advice." });
  }
});

// ──────────────────────────────────────────
// 2. Couple's Money Planner (Gemini)
// ──────────────────────────────────────────
app.post('/api/couple-plan', async (req, res) => {
  try {
    const { partnerAIncome, partnerBIncome, monthlyRent, monthlySips } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert Indian tax and financial planner specializing in married couples' joint finances.

    Partner A earns ₹${partnerAIncome} annually. Partner B earns ₹${partnerBIncome} annually.
    They pay ₹${monthlyRent}/month rent. Their combined SIPs are ₹${monthlySips}/month.

    Generate 3 specific joint optimization strategies covering:
    1. HRA optimization (which partner should have the rent agreement)
    2. NPS / 80CCD(1B) strategy across both PAN cards
    3. Insurance or SIP split recommendation

    Return ONLY valid JSON with no markdown code blocks:
    {
      "strategies": [
        { "title": "...", "description": "...", "savings": "₹XX,XXX/year" },
        { "title": "...", "description": "...", "savings": "₹XX,XXX/year" },
        { "title": "...", "description": "...", "savings": "₹XX,XXX/year" }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleanJsonStr);
    res.json(json);

  } catch (error) {
    console.error("Couple Plan AI Error:", error.message);
    res.status(500).json({ error: "Failed to generate couple strategy." });
  }
});

// ──────────────────────────────────────────
// 3. MF Portfolio X-Ray (Gemini)
// ──────────────────────────────────────────
app.post('/api/mf-xray', async (req, res) => {
  try {
    const { funds } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert Indian mutual fund analyst. A user has uploaded their portfolio.
    
    Analyze and generate a realistic portfolio X-Ray report. Assume they hold 4-5 popular Indian mutual funds.
    
    Return ONLY valid JSON with no markdown code blocks:
    {
      "trueXirr": 14.2,
      "overlapPercentage": 28,
      "expenseRatioAvg": 0.95,
      "currentValue": "₹12.4L",
      "investedValue": "₹9.8L",
      "recommendations": [
        { "action": "Exit", "fundName": "...", "impact": "- ₹XX,XXX", "reason": "..." },
        { "action": "Enter", "fundName": "...", "impact": "+ ₹XX,XXX", "reason": "..." }
      ]
    }`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const json = JSON.parse(cleanJsonStr);
    res.json(json);

  } catch (error) {
    console.error("MF X-Ray AI Error:", error.message);
    res.status(500).json({ error: "Failed to analyze portfolio." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`ET FinMentor AI Backend running on port ${PORT}`);
});
