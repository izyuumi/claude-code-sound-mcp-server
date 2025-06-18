import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "claude-code-sound-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

async function sendNotification(
  message: string,
  sound: string
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const soundFile = `/System/Library/Sounds/${sound}.aiff`;
  const command = new Deno.Command("afplay", {
    args: [soundFile],
  });

  try {
    const { code, stdout: _stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      return {
        content: [{ type: "text", text: `Failed to play sound: ${errorText}` }],
      };
    }

    return {
      content: [{ type: "text", text: `Sound played: ${sound} - ${message}` }],
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error playing sound: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }
}

server.setRequestHandler(ListToolsRequestSchema, () => {
  return {
    tools: [
      {
        name: "notify-file-edited",
        description:
          "Play a completion sound and show notification when Claude Code finishes editing a file",
        inputSchema: {
          type: "object",
          properties: {
            filename: {
              type: "string",
              description: "The name of the file that was edited",
            },
          },
          required: ["filename"],
        },
      },
      {
        name: "notify-build-complete",
        description:
          "Play a notification sound when build or compilation is complete",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "notify-test-complete",
        description:
          "Play a notification sound when test execution is complete",
        inputSchema: {
          type: "object",
          properties: {
            result: {
              type: "string",
              description:
                "The test result (e.g., 'Passed', 'Failed', '10/10 passed')",
            },
          },
          required: ["result"],
        },
      },
      {
        name: "notify-search-complete",
        description:
          "Play a notification sound when search or analysis is complete",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "notify-install-complete",
        description:
          "Play a notification sound when installation or setup is complete",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "notify-file-edited": {
      const { filename } = args as { filename: string };
      const message = `📝 File edited: ${filename}`;
      return await sendNotification(message, "Tink");
    }

    case "notify-build-complete": {
      const message = "🔨 Build complete";
      return await sendNotification(message, "Hero");
    }

    case "notify-test-complete": {
      const { result } = args as { result: string };
      const message = `✅ Test complete (${result})`;
      return await sendNotification(message, "Glass");
    }

    case "notify-search-complete": {
      const message = "🔍 Search/analysis complete";
      return await sendNotification(message, "Ping");
    }

    case "notify-install-complete": {
      const message = "📦 Installation/setup complete";
      return await sendNotification(message, "Funk");
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
