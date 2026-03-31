#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// ALLOWED_DOMAINS: comma-separated hostnames to whitelist (including subdomains)
// e.g. "api.example.com,example.com"
const ALLOWED_DOMAINS = (process.env.ALLOWED_DOMAINS || "fhsc.com.vn")
  .split(",")
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

const isAllowed = (hostname) =>
  ALLOWED_DOMAINS.some(
    (d) => hostname === d || hostname.endsWith(`.${d}`)
  );

const TOOLS = [
  {
    name: "http_request",
    description: `Proxy an HTTP request to allowed domains (${ALLOWED_DOMAINS.join(", ")}) with custom headers and body.`,
    inputSchema: {
      type: "object",
      properties: {
        url: {
          type: "string",
          description: "Full URL to request",
        },
        method: {
          type: "string",
          description: "HTTP method",
          enum: ["GET", "POST", "PUT", "DELETE", "PATCH"],
          default: "GET",
        },
        headers: {
          type: "object",
          description: "HTTP headers as key-value pairs",
          additionalProperties: { type: "string" },
        },
        body: {
          type: "string",
          description: "Request body (for POST/PUT/PATCH)",
        },
      },
      required: ["url"],
    },
  },
];

const err = (text) => ({ content: [{ type: "text", text }], isError: true });

const server = new Server(
  { name: "finhay-http-proxy", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { url, method = "GET", headers = {}, body } = request.params.arguments;

  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return err(`ERROR: Invalid URL: ${url}`);
  }

  if (!isAllowed(hostname)) {
    return err(
      `ERROR: Domain not allowed. Permitted: ${ALLOWED_DOMAINS.join(", ")}`
    );
  }

  try {
    const res = await fetch(url, {
      method,
      headers,
      ...(body && { body }),
      signal: AbortSignal.timeout(30000),
    });

    const text = await res.text();

    if (res.status >= 400) {
      return err(`ERROR: HTTP ${res.status}\n${text}`);
    }

    return { content: [{ type: "text", text }] };
  } catch (e) {
    return err(`ERROR: ${e.message}`);
  }
});

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
})();
