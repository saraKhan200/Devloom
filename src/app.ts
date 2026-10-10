import express, { type Request, type Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import createMcpServer from "./mcp/server.js";
import { config } from "./config.js";
import { runGeminiAgent } from "./agent/gemini.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- Middleware Setup ---
app.use(cors());
app.use(express.json());

// Serve the Vite build in production and source files during local development.
const frontendPath =
  config.nodeEnv === "production"
    ? path.resolve(__dirname, "../../public/dist")
    : path.resolve(__dirname, "../public");
app.use(express.static(frontendPath));

// Instantiate the MCP Server containing all registered GitHub tools
const mcpServer = createMcpServer();

// Active transport session map: activeTransports[sessionId] = transport
const activeTransports = new Map<string, SSEServerTransport>();

// --- Endpoint 1: SSE Connection (Establishes streaming channel) ---
app.get("/sse", async (req: Request, res: Response) => {
  try {
    // Construct transport endpoint with standard POST message path
    const transport = new SSEServerTransport("/messages", res);
    const sessionId = transport.sessionId;

    // Store transport instance by session ID
    activeTransports.set(sessionId, transport);

    // Clean up when client disconnects
    res.on("close", () => {
      activeTransports.delete(sessionId);
      console.log(`🔌 SSE session disconnected: ${sessionId}`);
    });

    await mcpServer.connect(transport);
    console.log(`⚡ New SSE connection established: ${sessionId}`);
  } catch (error) {
    console.error("Failed to establish SSE channel:", error);
    res.status(500).json({ error: "Could not open SSE stream" });
  }
});

// --- Endpoint 2: JSON-RPC Messages (Executes MCP tools) ---
app.post("/messages", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;

  if (!sessionId || !activeTransports.has(sessionId)) {
    return res.status(400).json({
      error: "Active SSE connection required. Connect to /sse first.",
    });
  }

  const transport = activeTransports.get(sessionId)!;

  try {
    // Extract user token from Authorization header: "Bearer ghp_xxx..."
    const authHeader = req.headers.authorization;
    const userToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : undefined;

    // Delegate message handling to MCP transport, attaching the token to context
    await transport.handlePostMessage(req, res, {
      requestContext: { authHeader: userToken },
    });
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).json({ error: "Failed to handle tool request" });
  }
});

app.post("/api/chat", async (req: Request, res: Response) => {
  const { prompt, geminiApiKey, githubToken } = req.body ?? {};

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > 500 ||
    typeof geminiApiKey !== "string" ||
    !geminiApiKey.trim() ||
    typeof githubToken !== "string" ||
    !githubToken.trim()
  ) {
    return res.status(400).json({
      error:
        "A prompt of up to 500 characters and both API tokens are required.",
    });
  }

  try {
    const response = await runGeminiAgent(
      prompt.trim(),
      geminiApiKey,
      githubToken,
    );
    return res.json({ response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown agent error occurred.";
    console.error("Gemini chat request failed:", message);
    return res.status(502).json({ error: message });
  }
});

// --- Start Express Server ---
app.listen(config.port, () => {
  console.log(`🚀 DevLoom server listening on http://localhost:${config.port}`);
  console.log(`💻 Web Dashboard live at http://localhost:${config.port}/`);
});
