# 🛡️ UI Protection Guide for Blaze Sports Intel

## Overview

This guide ensures that ChatGPT/Claude Code modifications never disrupt the web page design while allowing safe API enhancements through the Context7 integration.

## 🎯 Core Principles

### 1. **Strict Separation of Concerns**
- **API Layer**: `context7-enhanced/src/tools/` - Safe for AI modifications
- **UI Layer**: `index.html`, `css/`, `js/` - Protected from AI modifications
- **Service Layer**: All API calls must go through Context7Service

### 2. **Brand Color Protection**
These colors are **LOCKED** and require design review to modify:
- **Primary Dark**: `#1a1a1a`
- **Secondary Orange**: `#ff6b00` 
- **Accent Blue**: `#0066cc`
- **Background Gray**: `#2d2d2d`
- **Text White**: `#ffffff`

### 3. **Protected UI Files**
These files require special labels to modify:
- `index.html` - Main page structure
- `css/blaze-*.css` - Brand stylesheets
- `js/blaze-*.js` - Core UI JavaScript
- `apps/web/**` - Next.js web application

## 🔧 How to Use Context7 for Safe API Changes

### For ChatGPT/Claude Code Prompts:

```bash
# Always start API work with Context7
use context7

# Fetch documentation before coding
const recharts = await mcpCall("resolve-library-id", { libraryName: "Recharts" });
const docs = await mcpCall("get-library-docs", {
  context7CompatibleLibraryID: recharts.id,
  topic: "ResponsiveContainer + LineChart + Tooltip",
  tokens: 2500
});

# Only modify these files for API changes:
- context7-enhanced/src/tools/docs.ts
- context7-enhanced/src/tools/sportsContext.ts  
- context7-enhanced/src/tools/cache.ts
- context7-enhanced/src/index.ts
```

### For UI Changes (Human Review Required):

```bash
# Create PR with proper labels
git checkout -b ui-changes/new-feature
# Make UI changes
git commit -m "UI: Add new dashboard feature"
git push origin ui-changes/new-feature

# Create PR with labels:
- "ui-changes" 
- "design-review" (if colors modified)
```

## 🚨 CI/CD Protection Rules

### Automatic Blocks:
1. **API-only PRs** cannot modify UI files
2. **Brand colors** cannot be changed without design review
3. **Context7 tools** must follow established patterns
4. **Service layer** must be used for all API calls

### Required Labels:
- `api-only` - For pure API/Context7 changes
- `ui-changes` - For UI modifications
- `design-review` - For brand color changes
- `context7-integration` - For Context7 tool modifications

## 📋 Safe Modification Patterns

### ✅ Safe for AI (Context7 Tools):
```typescript
// context7-enhanced/src/tools/newTool.ts
import { z } from "zod";

export const NewToolInput = z.object({
  parameter: z.string().min(1)
});

export const NewToolOutput = z.object({
  result: z.string()
});

export const tools = {
  "new-tool": {
    inputSchema: NewToolInput,
    outputSchema: NewToolOutput
  }
};
```

### ❌ Unsafe for AI (UI Files):
```html
<!-- index.html - PROTECTED -->
<style>
  .brand-color {
    color: #ff6b00; /* LOCKED - requires design review */
  }
</style>
```

### ✅ Safe Service Layer Pattern:
```javascript
// js/api-service.js - Safe for AI modification
class Context7Service {
  async getLibraryDocs(libraryName, topic) {
    // Implementation using Context7 MCP
    return await this.mcpCall("get-library-docs", {
      context7CompatibleLibraryID: libraryName,
      topic: topic,
      tokens: 2500
    });
  }
}
```

## 🔍 Monitoring & Alerts

### Automatic Monitoring:
- **GitHub Actions** check for UI changes in API-only PRs
- **Drift Detection** monitors for unauthorized modifications
- **Brand Color Validation** prevents color drift
- **Context7 Integration Tests** ensure proper API patterns

### Manual Reviews Required:
- Any changes to `index.html`
- Modifications to `css/blaze-*.css`
- Updates to brand colors
- Changes to core UI JavaScript

## 🚀 Best Practices

### For AI-Assisted Development:
1. **Always use Context7** for documentation lookup
2. **Stick to service layer** for API modifications
3. **Use proper labels** when creating PRs
4. **Follow established patterns** in Context7 tools
5. **Never bypass the service layer** for API calls

### For UI Development:
1. **Create separate branches** for UI changes
2. **Use design review process** for color changes
3. **Test thoroughly** before merging UI changes
4. **Document UI changes** in PR descriptions
5. **Coordinate with API changes** when needed

## 📞 Support

If you encounter issues with the protection system:
- Check the GitHub Actions logs for specific failures
- Review the Context7 integration guide
- Contact the development team for UI changes
- Use the design review process for brand modifications

---

**Remember**: The goal is to enable rapid API development through Context7 while protecting the carefully crafted UI design. When in doubt, create a separate PR for UI changes and use the proper review process.