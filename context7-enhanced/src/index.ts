// context7-enhanced/src/index.ts
import { tools as docsTools } from "./tools/docs";
import { tools as sportsTools } from "./tools/sportsContext";
import { tools as cacheTools } from "./tools/cache";

// Export a combined tool table for your MCP server framework
export const mcpTools = {
  ...docsTools,
  ...sportsTools,   // supplemental only
  ...cacheTools     // dev-only; gate behind NODE_ENV
};