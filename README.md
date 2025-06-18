# claude-code-sound-mcp-server

Sound notifications via MCP for Claude Code (or anything really) operations (macOS only).

## Setup

```bash
deno install
```

## Configuration

Copy [`example.mcp.json`](example.mcp.json) to your MCP configuration directory and adjust paths.

## Usage

```bash
deno run --allow-all main.ts
```

## Features

- File edit completion sounds
- Build completion notifications
- Test completion notifications
- Search completion notifications
- Installation completion notifications

## Coming Soon

- Customizable audio files for each notification type

## License

MIT
