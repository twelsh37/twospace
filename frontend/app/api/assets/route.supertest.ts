// frontend/app/api/assets/route.supertest.ts
// Express-based test harness for Next.js API route handlers
// Allows SuperTest to send requests to the handlers as if running in production

import express from "express";
import { GET, POST, PUT } from "./route";

// Helper to convert Express req/res to Next.js handler signature
function wrapNextHandler(handler: any, method: string) {
  return async (req: express.Request, res: express.Response) => {
    // Build a mock NextRequest
    const url = req.originalUrl || req.url;
    const body = req.body;
    const nextReq = {
      url: `${req.protocol}://${req.get("host")}${url}`,
      method,
      json: async () => body,
      headers: req.headers,
      nextUrl: {
        searchParams: new URL(url, `http://${req.get("host")}`).searchParams,
      },
    };
    // Call the handler
    const nextRes = await handler(nextReq);
    // The handler returns a NextResponse-like object
    const data = await nextRes.json();
    res.status(nextRes.status || 200).json(data);
  };
}

const app = express();
app.use(express.json());

app.get("/api/assets", wrapNextHandler(GET, "GET"));
app.post("/api/assets", wrapNextHandler(POST, "POST"));
app.put("/api/assets", wrapNextHandler(PUT, "PUT"));

export default app;
