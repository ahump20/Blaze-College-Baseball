# AI Assistant Guidelines for Blaze Sports Intel

## 🎯 Overview

This document provides clear guidelines for AI code assistants (Claude Code, ChatGPT, etc.) working on the Blaze Sports Intel project. The primary goal is to maintain strict separation between API logic and UI components.

## 🔒 CRITICAL RULES

### ✅ ALWAYS ALLOWED
- **API Layer Modifications**: Any files in `lib/api/`, `functions/api/`, or `unity-app/Assets/Scripts/Context7/`
- **Context7Service.cs**: The singleton service that handles all API calls
- **MCPClient.cs**: MCP protocol implementation
- **DocumentationManager.cs**: Documentation caching and retrieval
- **Business Logic**: Data processing, analytics calculations, API integrations
- **Configuration**: Environment variables, API keys, service endpoints
- **Tests**: Unit tests, integration tests, API tests

### ❌ NEVER ALLOWED
- **UI Components**: Any files in `unity-app/Assets/Scripts/UI/`
- **CSS/HTML**: Any styling or layout files
- **Color Values**: Brand colors, UI theme colors, visual styling
- **Layout Logic**: UI positioning, sizing, visual arrangement
- **User Interaction**: Button handlers, form validation, UI state management

## 🏗️ Architecture Principles

### 1. Singleton Pattern for API Access
```csharp
// ✅ CORRECT: All API calls go through Context7Service
public class MyUIComponent : MonoBehaviour
{
    void Start()
    {
        var service = Context7Service.Instance;
        if (service != null)
        {
            // Use the service for API calls
        }
    }
}

// ❌ WRONG: Direct API calls from UI components
public class MyUIComponent : MonoBehaviour
{
    private HttpClient client = new HttpClient(); // NEVER DO THIS
}
```

### 2. Protected Brand Colors
```csharp
// ✅ CORRECT: Brand colors are protected and documented
[Header("UI Brand Colors - DO NOT MODIFY WITHOUT DESIGN REVIEW")]
[SerializeField] private Color primaryColor = new Color(0f, 0.4f, 0.8f, 1f); // Blaze Blue

// ❌ WRONG: Exposed or modifiable brand colors
public Color primaryColor = Color.blue; // NEVER DO THIS
```

### 3. Clear Separation of Concerns
- **API Layer**: Handles data, communication, business logic
- **UI Layer**: Handles presentation, user interaction, visual feedback
- **Service Layer**: Mediates between API and UI layers

## 🛠️ Implementation Guidelines

### For API Modifications

1. **Always use Context7Service for API calls**
   ```csharp
   // ✅ CORRECT
   var response = await Context7Service.Instance.GetLibraryDocumentation("/unity/unity", "scripting");
   
   // ❌ WRONG
   var client = new HttpClient();
   var response = await client.PostAsync(url, content);
   ```

2. **Implement proper error handling**
   ```csharp
   var response = await Context7Service.Instance.GetLibraryDocumentation(libraryId, topic);
   if (response.success)
   {
       // Process successful response
       ProcessDocumentation(response.content);
   }
   else
   {
       // Handle error appropriately
       LogError($"API call failed: {response.error}");
   }
   ```

3. **Use caching when appropriate**
   ```csharp
   // Context7Service automatically handles caching
   // No additional caching logic needed in UI components
   ```

### For UI Modifications (Design Review Required)

1. **Never modify UI components without explicit permission**
2. **Always preserve brand colors and styling**
3. **Maintain existing UI patterns and conventions**
4. **Test UI changes thoroughly before submitting**

## 🔍 Code Review Checklist

### API Changes
- [ ] Changes are in API layer files only
- [ ] Context7Service is used for all API calls
- [ ] Error handling is implemented
- [ ] Caching is properly configured
- [ ] Tests are updated/added
- [ ] Documentation is updated

### UI Changes (Requires Design Review)
- [ ] Design team has approved changes
- [ ] Brand colors are preserved
- [ ] UI patterns are maintained
- [ ] Accessibility is considered
- [ ] Cross-platform compatibility is verified

## 🚨 Common Mistakes to Avoid

### 1. Direct HTTP Calls in UI Components
```csharp
// ❌ WRONG
public class AnalyticsDashboard : MonoBehaviour
{
    private HttpClient client = new HttpClient();
    
    public async void LoadData()
    {
        var response = await client.GetAsync("https://api.example.com/data");
        // Process response...
    }
}

// ✅ CORRECT
public class AnalyticsDashboard : MonoBehaviour
{
    public async void LoadData()
    {
        if (Context7Service.Instance != null)
        {
            var response = await Context7Service.Instance.GetSportsAnalyticsDocumentation("data");
            if (response.success)
            {
                // Process response...
            }
        }
    }
}
```

### 2. Modifying Brand Colors
```csharp
// ❌ WRONG
public Color primaryColor = Color.blue; // Hardcoded color

// ✅ CORRECT
[SerializeField] private Color primaryColor = new Color(0f, 0.4f, 0.8f, 1f); // Brand color with comment
```

### 3. Bypassing the Service Layer
```csharp
// ❌ WRONG
public class MyComponent : MonoBehaviour
{
    public async Task<string> GetData()
    {
        // Direct API call
        var client = new HttpClient();
        return await client.GetStringAsync("https://api.example.com/data");
    }
}

// ✅ CORRECT
public class MyComponent : MonoBehaviour
{
    public async Task<string> GetData()
    {
        if (Context7Service.Instance != null)
        {
            var response = await Context7Service.Instance.GetLibraryDocumentation("/custom/library");
            return response.success ? response.content : response.error;
        }
        return null;
    }
}
```

## 📚 Context7 Integration

### Available Documentation Libraries
- `/unity/unity` - Unity scripting and API documentation
- `/sports/analytics` - Sports data analysis tools
- `/python/python` - Python data science libraries
- `/sports/biomechanics` - Biomechanical analysis
- `/ml/tensorflow` - Machine learning frameworks
- `/viz/chartjs` - Data visualization libraries

### Usage Examples
```csharp
// Get Unity documentation
var unityDocs = await Context7Service.Instance.GetUnityDocumentation("scripting");

// Get sports analytics documentation
var sportsDocs = await Context7Service.Instance.GetSportsAnalyticsDocumentation("biomechanics");

// Get custom documentation
var customDocs = await Context7Service.Instance.GetLibraryDocumentation("/custom/library", "specific-topic", 3000);
```

## 🔧 Testing Guidelines

### API Tests
```csharp
[Test]
public void Context7Service_ReturnsValidResponse()
{
    var service = Context7Service.Instance;
    Assert.IsNotNull(service);
    
    var response = await service.GetUnityDocumentation("scripting");
    Assert.IsTrue(response.success);
    Assert.IsNotEmpty(response.content);
}
```

### UI Tests
```csharp
[Test]
public void UIComponents_UseContext7Service()
{
    var dashboard = new GameObject().AddComponent<AnalyticsDashboard>();
    
    // Verify no direct HTTP clients
    var httpFields = typeof(AnalyticsDashboard).GetFields()
        .Where(f => f.FieldType == typeof(HttpClient));
    
    Assert.IsEmpty(httpFields);
}
```

## 🚀 Deployment Considerations

### API Changes
- Deploy to staging environment first
- Run full test suite
- Monitor API performance and error rates
- Update documentation if needed

### UI Changes
- Require design team approval
- Test on multiple devices/platforms
- Verify accessibility compliance
- Check brand consistency

## 📞 Support and Escalation

### For API Issues
1. Check Context7Service logs
2. Verify MCP server status
3. Review API configuration
4. Check network connectivity

### For UI Issues
1. Contact design team
2. Review brand guidelines
3. Check UI component documentation
4. Verify accessibility requirements

### For Integration Issues
1. Review this documentation
2. Check Unity console logs
3. Verify service initialization
4. Test API connectivity

---

## 🎯 Summary

**Remember**: Always use `Context7Service.Instance` for API calls. Never make direct HTTP requests from UI components. When in doubt, ask for clarification before making changes to UI files.

**Key Principle**: API logic can be modified freely, but UI changes require design review and approval.

**Success Metric**: AI assistants should be able to modify API functionality without affecting the visual design or user experience.