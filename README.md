# finhay-http-proxy

HTTP proxy MCP server for Finhay — forward requests with custom headers to allowed domains.

## Installation

### Claude Desktop

Open the Claude Desktop config file:

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

Add the following to `mcpServers`:

```json
{
  "mcpServers": {
    "finhay-http-proxy": {
      "command": "npx",
      "args": ["-y", "finhay-http-proxy"],
      "env": {
        "ALLOWED_DOMAINS": "fhsc.com.vn"
      }
    }
  }
}
```

Restart Claude Desktop after saving.

### Claude Code

Add to your `.mcp.json`:

```json
{
  "mcpServers": {
    "finhay-http-proxy": {
      "command": "npx",
      "args": ["-y", "finhay-http-proxy"],
      "env": {
        "ALLOWED_DOMAINS": "fhsc.com.vn"
      }
    }
  }
}
```

Multiple domains: `"ALLOWED_DOMAINS": "fhsc.com.vn,api.example.com"`

## Tool

### `http_request`

| Parameter | Type   | Required | Description                        |
|-----------|--------|----------|------------------------------------|
| url       | string | yes      | Full URL to request                |
| method    | string | no       | GET, POST, PUT, DELETE, PATCH      |
| headers   | object | no       | HTTP headers as key-value pairs    |
| body      | string | no       | Request body (for POST/PUT/PATCH)  |

## Environment

| Variable         | Default       | Description                              |
|------------------|---------------|------------------------------------------|
| ALLOWED_DOMAINS  | `fhsc.com.vn` | Comma-separated list of allowed domains  |
