import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up server-side Gemini client
const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

app.use(express.json());

// Base financial assets with fluctuating motion
const BASE_FOREX: Record<string, number> = {
  USD: 1.00,
  EUR: 0.92,
  GBP: 0.78,
  JPY: 156.40,
  CAD: 1.37,
  AUD: 1.51,
  NGN: 1450.00,
};

const BASE_CYRPTO: Record<string, number> = {
  BTC: 68500.00,
  ETH: 3820.00,
  SOL: 164.50,
  ADA: 0.46,
  DOGE: 0.14,
};

const BASE_STOCKS: Record<string, number> = {
  AAPL: 189.50,
  GOOG: 173.80,
  MSFT: 429.20,
  AMZN: 181.10,
  TSLA: 178.60,
  NVDA: 1060.00,
};

// Generates slightly fluctuating rates based on timestamps
const getFluctuatingPrice = (baseVal: number, seedString: string, volatility = 0.008): number => {
  const hash = seedString.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const timeFactor = Math.sin((Date.now() / 15000) + hash); // 15s cycle
  const randomFactor = Math.cos((Date.now() / 60000) * hash); 
  const shift = (timeFactor * 0.7 + randomFactor * 0.3) * volatility;
  return Number((baseVal * (1 + shift)).toFixed(4));
};

// Expose Live Prices API
app.get("/api/prices", (req, res) => {
  const forex: Record<string, number> = {};
  const crypto: Record<string, number> = {};
  const stocks: Record<string, number> = {};

  Object.entries(BASE_FOREX).forEach(([key, val]) => {
    // Keep USD as perfect 1.00 baseline
    forex[key] = key === "USD" ? 1.00 : getFluctuatingPrice(val, key, 0.004);
  });

  Object.entries(BASE_CYRPTO).forEach(([key, val]) => {
    crypto[key] = getFluctuatingPrice(val, key, 0.015); // Crypto is more volatile
  });

  Object.entries(BASE_STOCKS).forEach(([key, val]) => {
    stocks[key] = getFluctuatingPrice(val, key, 0.008);
  });

  res.json({
    status: "ok",
    timestamp: Date.now(),
    prices: {
      forex,
      crypto,
      stocks,
    },
  });
});

// AI Advisor API using Gemini
app.post("/api/gemini/advisor", async (req, res) => {
  try {
    if (!ai) {
      return res.status(403).json({
        error: "Advisor unconfigured: Please verify that GEMINI_API_KEY is defined in your Secrets.",
      });
    }

    const { expenses, portfolio, quoteCurrency } = req.body;

    const portfolioSummary = JSON.stringify({
      quoteCurrency,
      expensesCount: expenses?.length || 0,
      expensesTotalEstimated: expenses?.reduce((sum: number, e: any) => sum + (e.convertedValue || 0), 0),
      expensesDetails: expenses?.map((e: any) => ({
        label: e.label,
        category: e.category,
        amount: e.value,
        originalCurrency: e.currency,
        baseValue: e.convertedValue,
      })),
      assetsCount: portfolio?.length || 0,
      assetsDetails: portfolio?.map((p: any) => ({
        symbol: p.symbol,
        type: p.type,
        holdings: p.quantity,
        currentPrice: p.currentPrice,
        totalValue: (p.quantity || 0) * (p.currentPrice || 0),
      })),
    }, null, 2);

    const prompt = `
You are the Fortune Navigator Advisor, an elite financial intelligence bot. Analyze the user's multi-currency asset portfolio and expenses:

User Portfolio & Expenses Context:
${portfolioSummary}

Provide a robust personal executive financial summary, structured as follows:
1. **Financial Health Index**: Output a rating from A to F on overall portfolio diversification, asset-liability state, and currency exposure, with an objective 1-sentence justification.
2. **Key Insights & Performance Risks**: Short bulleted diagnostic insights emphasizing currency hedging opportunities, concentration risks (e.g., too much crypto vs stock), or excessive categories in expenditures.
3. **Strategic Recommendations**: 2-3 specific, actionable steps to optimize returns, mitigate FX conversion leakage, or budget better.

Ensure your tone is concise, authoritative, and helpful. Format your entire answer in clean Markdown. Avoid empty jargon, keep it structured, and never invent fake system variables or display logs.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    res.json({
      status: "ok",
      analysis: response.text || "No insights generated.",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ error: error.message || "An error occurred with Gemini." });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Fortune Server] Running smoothly on port ${PORT}`);
  });
}

startServer();
