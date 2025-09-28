import { expect, test, describe } from "@jest/globals";
import * as fs from "fs";
import * as path from "path";

/**
 * UI Protection Tests for Context7 Integration
 * Ensures API/UI separation is maintained
 */

describe("UI Protection - Context7 Integration", () => {
  const context7ToolsDir = path.join(__dirname, "../src/tools");
  const uiFiles = [
    "../../index.html",
    "../../css/blaze-revolutionary-command-center.css",
    "../../css/blaze-ultimate-aesthetics.css",
    "../../js/blaze-revolutionary-command-center.js",
    "../../js/blaze-ultimate-visual-engine.js"
  ];

  test("Context7 tools follow proper structure", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Must have Zod imports
      expect(content).toMatch(/import.*z.*from.*"zod"/);
      
      // Must export tools object
      expect(content).toMatch(/export const tools/);
      
      // Must have proper input/output schemas
      expect(content).toMatch(/Input.*z\.object/);
      expect(content).toMatch(/Output.*z\.object/);
      
      // Must not contain UI-specific code
      expect(content).not.toMatch(/document\.|window\.|DOM/);
      expect(content).not.toMatch(/\.css|\.html|\.js/);
      expect(content).not.toMatch(/#[0-9a-fA-F]{6}/); // No hardcoded colors
    }
  });

  test("Context7 tools don't reference UI files", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Should not import UI files
      for (const uiFile of uiFiles) {
        expect(content).not.toMatch(new RegExp(uiFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
    }
  });

  test("Context7 tools have proper MCP integration", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Should have tool descriptors for MCP
      expect(content).toMatch(/inputSchema:/);
      expect(content).toMatch(/outputSchema:/);
      
      // Should not have direct HTTP calls (should use MCP)
      expect(content).not.toMatch(/fetch\(|axios\.|http\./);
    }
  });

  test("Brand colors are not hardcoded in tools", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    const protectedColors = [
      "#1a1a1a", // Primary dark
      "#ff6b00", // Secondary orange  
      "#0066cc", // Accent blue
      "#2d2d2d", // Background gray
      "#ffffff"  // Text white
    ];

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      for (const color of protectedColors) {
        expect(content).not.toContain(color);
      }
    }
  });

  test("Context7 tools don't modify DOM or UI", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    const uiModificationPatterns = [
      /innerHTML|outerHTML/,
      /appendChild|removeChild/,
      /createElement/,
      /style\./,
      /classList\./,
      /setAttribute/,
      /addEventListener/
    ];

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      for (const pattern of uiModificationPatterns) {
        expect(content).not.toMatch(pattern);
      }
    }
  });

  test("Context7 tools use proper error handling", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Should have proper error handling patterns
      expect(content).toMatch(/try\s*{|catch\s*\(|throw new Error/);
      
      // Should not have console.log in production code
      expect(content).not.toMatch(/console\.log/);
    }
  });

  test("Context7 tools follow Blaze sports ordering", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // If sports are mentioned, should follow proper ordering
      if (content.includes("baseball") || content.includes("football") || 
          content.includes("basketball") || content.includes("track")) {
        
        // Should not include soccer
        expect(content).not.toMatch(/soccer|football.*soccer/i);
        
        // Should use proper sports enum if defined
        if (content.includes("sport.*enum")) {
          expect(content).toMatch(/baseball.*football.*basketball.*track/);
        }
      }
    }
  });

  test("Context7 tools respect token limits", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Should have token limits defined
      if (content.includes("tokens")) {
        expect(content).toMatch(/tokens.*\.int\(\)\.min\(\d+\)\.max\(\d+\)/);
        
        // Should have reasonable limits
        const maxTokenMatch = content.match(/\.max\((\d+)\)/);
        if (maxTokenMatch) {
          const maxTokens = parseInt(maxTokenMatch[1]);
          expect(maxTokens).toBeLessThanOrEqual(5000); // Max 5k tokens
          expect(maxTokens).toBeGreaterThanOrEqual(500); // Min 500 tokens
        }
      }
    }
  });

  test("Context7 tools are properly typed", () => {
    const toolFiles = fs.readdirSync(context7ToolsDir)
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7ToolsDir, file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      // Should use proper TypeScript patterns
      expect(content).toMatch(/export const \w+Input/);
      expect(content).toMatch(/export const \w+Output/);
      expect(content).toMatch(/export const tools/);
      
      // Should not use any type
      expect(content).not.toMatch(/\:\s*any\b/);
    }
  });
});

describe("UI Protection - File Structure", () => {
  test("UI files are not modified by Context7 tools", () => {
    const context7Dir = path.join(__dirname, "..");
    const uiFiles = [
      "index.html",
      "css/blaze-revolutionary-command-center.css",
      "css/blaze-ultimate-aesthetics.css",
      "js/blaze-revolutionary-command-center.js",
      "js/blaze-ultimate-visual-engine.js"
    ];

    // Check that Context7 tools don't reference UI files
    const toolFiles = fs.readdirSync(path.join(context7Dir, "src/tools"))
      .filter(file => file.endsWith('.ts'))
      .map(file => path.join(context7Dir, "src/tools", file));

    for (const toolFile of toolFiles) {
      const content = fs.readFileSync(toolFile, 'utf8');
      
      for (const uiFile of uiFiles) {
        expect(content).not.toMatch(new RegExp(uiFile.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
      }
    }
  });

  test("Context7 integration doesn't break UI structure", () => {
    // This test ensures that Context7 integration doesn't accidentally
    // modify the main UI files
    const mainIndexPath = path.join(__dirname, "../../index.html");
    
    if (fs.existsSync(mainIndexPath)) {
      const content = fs.readFileSync(mainIndexPath, 'utf8');
      
      // Should still have proper HTML structure
      expect(content).toMatch(/<!DOCTYPE html>/);
      expect(content).toMatch(/<html lang="en">/);
      expect(content).toMatch(/<head>/);
      expect(content).toMatch(/<body>/);
      
      // Should have brand colors intact
      expect(content).toMatch(/#1a1a1a|#ff6b00|#0066cc/);
    }
  });
});