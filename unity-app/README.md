# Unity Context7 Integration - API/UI Separation Guide

## 🎯 Overview

This Unity project implements a robust Context7 integration with strict separation between API and UI components. This architecture ensures that AI code assistants (like Claude Code) can modify API logic without affecting UI design.

## 🏗️ Architecture

### API Layer (Modifiable by AI Assistants)
- **`Context7Service.cs`** - Singleton service handling ALL Context7 API calls
- **`MCPClient.cs`** - MCP protocol client for Context7 communication
- **`DocumentationManager.cs`** - Manages documentation caching and retrieval

### UI Layer (Protected - Requires Design Review)
- **`AnalyticsDashboard.cs`** - Main dashboard UI component
- **`DocumentationPanel.cs`** - Documentation search and display UI
- All files in `Assets/Scripts/UI/` directory

## 🔒 Protection Mechanisms

### 1. Singleton Pattern Enforcement
```csharp
// Context7Service.cs - The ONLY class that should make API calls
public class Context7Service : MonoBehaviour
{
    public static Context7Service Instance { get; private set; }
    
    // All API calls go through this service
    public async Task<Context7Response> GetLibraryDocumentation(string libraryId, string topic = "", int tokens = -1)
}
```

### 2. UI Component Restrictions
```csharp
// AnalyticsDashboard.cs - UI components should NEVER make direct API calls
public class AnalyticsDashboard : MonoBehaviour
{
    // ❌ NEVER do this in UI components:
    // private HttpClient client = new HttpClient();
    
    // ✅ ALWAYS do this instead:
    private Context7Service context7Service;
    
    void Start()
    {
        context7Service = Context7Service.Instance;
    }
}
```

### 3. Brand Color Protection
```csharp
[Header("UI Brand Colors - DO NOT MODIFY WITHOUT DESIGN REVIEW")]
[SerializeField] private Color improvingColor = new Color(0f, 0.8f, 0f, 1f); // Blaze Green
[SerializeField] private Color decliningColor = new Color(1f, 0.2f, 0.2f, 1f); // Blaze Red  
[SerializeField] private Color neutralColor = new Color(1f, 0.8f, 0f, 1f); // Blaze Yellow
```

## 🚀 Usage Guidelines

### For AI Code Assistants (Claude Code, ChatGPT, etc.)

**✅ ALLOWED MODIFICATIONS:**
- `Context7Service.cs` - API logic, caching, error handling
- `MCPClient.cs` - MCP protocol implementation
- `DocumentationManager.cs` - Documentation management
- Any files in `Assets/Scripts/Context7/` directory
- API endpoints and data processing logic

**❌ FORBIDDEN MODIFICATIONS:**
- Any files in `Assets/Scripts/UI/` directory
- Color values and UI styling
- Layout and positioning logic
- User interaction handlers (except for API integration)
- Visual design elements

### For Human Developers

**When modifying API layer:**
1. Make changes to `Context7Service.cs` or related API files
2. Test API functionality thoroughly
3. Ensure UI components continue to work with updated API

**When modifying UI layer:**
1. Create a new branch with `ui-change` prefix
2. Add `ui-change` and `needs-design-review` labels
3. Request design team review
4. Ensure brand consistency is maintained

## 🛠️ Development Workflow

### 1. Setting Up Context7Service
```csharp
// In your scene, ensure Context7Service is present
var context7Service = Context7Service.Instance;
if (context7Service == null)
{
    Debug.LogError("Context7Service not found! Please add it to the scene.");
}
```

### 2. Using Context7Service in UI Components
```csharp
public class MyUIComponent : MonoBehaviour
{
    public async void LoadDocumentation()
    {
        if (Context7Service.Instance != null)
        {
            var response = await Context7Service.Instance.GetUnityDocumentation("scripting");
            if (response.success)
            {
                // Display the documentation
                DisplayContent(response.content);
            }
        }
    }
}
```

### 3. Testing API Changes
```csharp
// Test API functionality without affecting UI
[Test]
public void TestContext7Service()
{
    var service = Context7Service.Instance;
    Assert.IsNotNull(service);
    
    // Test API calls
    var response = await service.GetLibraryDocumentation("/unity/unity", "scripting");
    Assert.IsTrue(response.success);
}
```

## 🔧 Configuration

### Context7Service Configuration
```csharp
[Header("Context7 Configuration")]
[SerializeField] private string mcpServerUrl = "http://localhost:8080";
[SerializeField] private string apiKey = "ctx7sk-30e11e35-4b11-400c-9674-47d39d05aac5";
[SerializeField] private int maxTokens = 5000;
[SerializeField] private bool enableCaching = true;
[SerializeField] private int cacheTimeoutSeconds = 300;
```

### UI Brand Colors (Protected)
```csharp
// These colors should only be changed with design team approval
private Color primaryColor = new Color(0f, 0.4f, 0.8f, 1f); // Blaze Blue
private Color secondaryColor = new Color(0.2f, 0.2f, 0.2f, 1f); // Blaze Dark
private Color accentColor = new Color(1f, 0.4f, 0f, 1f); // Blaze Orange
```

## 🚨 CI/CD Protection

The project includes automated checks that prevent unauthorized UI modifications:

1. **UI Token Guard** (`scripts/check-ui-tokens.sh`)
   - Detects changes to UI files
   - Requires design review labels
   - Prevents accidental UI modifications

2. **GitHub Actions Workflow** (`.github/workflows/ui-protection.yml`)
   - Runs on every PR
   - Automatically labels UI change PRs
   - Requires design team approval

3. **API/UI Separation Tests**
   - Verifies singleton pattern implementation
   - Ensures UI components use Context7Service
   - Prevents direct HTTP calls in UI components

## 📚 Context7 Integration

### Available Documentation Libraries
- **Unity**: `/unity/unity` - Unity scripting and API documentation
- **Sports Analytics**: `/sports/analytics` - Sports data analysis tools
- **Python**: `/python/python` - Python data science libraries
- **Biomechanics**: `/sports/biomechanics` - Biomechanical analysis
- **Machine Learning**: `/ml/tensorflow` - ML frameworks
- **Data Visualization**: `/viz/chartjs` - Charting libraries

### Example Usage
```csharp
// Get Unity documentation
var unityDocs = await Context7Service.Instance.GetUnityDocumentation("scripting");

// Get sports analytics documentation  
var sportsDocs = await Context7Service.Instance.GetSportsAnalyticsDocumentation("biomechanics");

// Get custom library documentation
var customDocs = await Context7Service.Instance.GetLibraryDocumentation("/custom/library", "specific-topic", 3000);
```

## 🔍 Troubleshooting

### Common Issues

1. **Context7Service not found**
   - Ensure Context7Service is added to your scene
   - Check that the singleton pattern is working correctly

2. **API calls failing**
   - Verify MCP server is running
   - Check API key configuration
   - Review network connectivity

3. **UI not updating**
   - Ensure UI components are using Context7Service.Instance
   - Check that UI components are subscribed to appropriate events

### Debug Information
```csharp
// Get cache statistics
var stats = Context7Service.Instance.GetCacheStats();
Debug.Log($"Cache entries: {stats["entries"]}");

// Clear cache if needed
Context7Service.Instance.ClearCache();
```

## 📞 Support

For issues with:
- **API Layer**: Check Context7Service logs and MCP server status
- **UI Layer**: Contact design team for UI-related changes
- **Integration**: Review this documentation and Unity console logs

---

**Remember**: Always use `Context7Service.Instance` for API calls in UI components. Never make direct HTTP requests from UI code!