# Context7 Unity Integration - Best Practices Guide 🔥

## Overview

This guide outlines the best practices for maintaining the Context7 Unity integration while keeping API and UI work properly decoupled. The integration follows Unity's recommended patterns for separation of concerns and provides robust guardrails against UI drift.

## 🏗️ Architecture Overview

### Core Components

1. **Context7Service.cs** - Singleton API service handling all HTTP/MCP calls
2. **Context7Signals.cs** - Custom signals system for performance and context management
3. **Context7EditorWindow.cs** - Editor tooling for contextual documentation access
4. **MCPClient.cs** - Low-level MCP protocol client
5. **DocumentationManager.cs** - Runtime UI controller (FROZEN - UI layer)

### Separation of Concerns

```
┌─────────────────────────────────────────────────────────────┐
│                    UI Layer (FROZEN)                        │
├─────────────────────────────────────────────────────────────┤
│  DocumentationManager.cs  │  DocumentationPanel.cs         │
│  (Runtime UI Controller)  │  (UI Components)               │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (MODIFIABLE)                     │
├─────────────────────────────────────────────────────────────┤
│  Context7Service.cs      │  Context7Signals.cs             │
│  (Singleton API Service) │  (Custom Signals System)        │
│                          │                                 │
│  MCPClient.cs            │  Context7EditorWindow.cs        │
│  (MCP Protocol Client)   │  (Editor Tooling)               │
└─────────────────────────────────────────────────────────────┘
```

## 🚫 UI Freeze Policy

### Frozen Files (Require Design Review)
- `unity-app/Assets/Scripts/UI/` - All UI controllers
- `unity-app/Assets/Scenes/` - Unity scenes
- `unity-app/Assets/Prefabs/` - UI prefabs
- `unity-app/Assets/Materials/` - Visual materials
- `unity-app/Assets/Textures/` - UI textures
- `unity-app/Assets/Shaders/` - Custom shaders
- `unity-app/Assets/Animations/` - UI animations

### Modifiable Files (API Development)
- `unity-app/Assets/Scripts/Context7/` - API layer
- `unity-app/Assets/Scripts/SportsAnalytics/` - Data processing
- `unity-app/ProjectSettings/` - Project configuration
- `*.cs` files in API directories
- Configuration and documentation files

## 🔧 Development Guidelines

### 1. API Service Usage

Always use the singleton Context7Service for all API calls:

```csharp
// ✅ Correct - Use singleton service
var service = Context7Service.Instance;
string docs = await service.GetUnityDocsAsync("scripting");

// ❌ Incorrect - Direct API calls
// Don't bypass the service layer
```

### 2. Signal-Based Communication

Use the signals system for loose coupling:

```csharp
// Subscribe to events
Context7Signals.DocumentationReceived.Subscribe(OnDocsReceived);
Context7Signals.ErrorOccurred.Subscribe(OnError);

// Emit events
Context7Signals.SearchPerformed.Invoke(new SearchQuery
{
    Query = "Unity scripting",
    LibraryId = "/unity/unity",
    Tokens = 5000
});
```

### 3. Performance Optimization

Record performance metrics for monitoring:

```csharp
// Record API response times
var stopwatch = Stopwatch.StartNew();
var result = await service.GetLibraryDocsAsync(libraryId, topic, tokens);
stopwatch.Stop();

Context7Signals.RecordMetric("api_response_time", stopwatch.ElapsedMilliseconds, "ms");
```

### 4. Error Handling

Implement comprehensive error handling:

```csharp
try
{
    var result = await service.GetLibraryDocsAsync(libraryId, topic, tokens);
    if (string.IsNullOrEmpty(result))
    {
        Context7Signals.ErrorOccurred.Invoke("Empty response from API");
    }
}
catch (Exception e)
{
    Context7Signals.ErrorOccurred.Invoke($"API Error: {e.Message}");
    Debug.LogError($"[Context7] {e.Message}");
}
```

## 🎯 Context7 MCP Integration

### Using Context7 in Prompts

When working with Claude Code, always use Context7 for documentation:

```
Use context7 to get Unity documentation before implementing features.
Focus on API layer changes only - UI files are frozen.
```

### Available MCP Tools

- `get-library-docs` - Fetch documentation
- `resolve-library-id` - Resolve library identifiers
- `sports-context` - Get sports-specific context
- `inject-sports-context` - Inject live sports data

### Library Mappings

```csharp
var libraryMappings = new Dictionary<string, string>
{
    { "Unity Engine", "/unity/unity" },
    { "Sports Analytics", "/sports/analytics" },
    { "Python Data Science", "/python/python" },
    { "Machine Learning", "/ml/machine-learning" },
    { "Computer Vision", "/cv/computer-vision" }
};
```

## 🛡️ CI Guardrails

### Automatic Checks

The CI system automatically:

1. **Detects UI modifications** - Blocks PRs with UI changes
2. **Requires design review** - Adds labels for UI changes
3. **Verifies API-only changes** - Ensures only allowed files modified
4. **Runs Unity tests** - Validates API functionality
5. **Generates build reports** - Documents changes made

### Bypassing UI Freeze

To modify UI files:

1. Create a separate UI branch
2. Add `ui-change` and `needs-design-review` labels
3. Get approval from @ahump20
4. Merge UI changes separately from API changes

## 📊 Monitoring and Analytics

### Performance Metrics

Track these key metrics:

- API response times
- Cache hit rates
- Error rates
- Memory usage
- Request queue depth

### Health Checks

Monitor service health:

```csharp
var service = Context7Service.Instance;
bool isHealthy = service.IsConnected() && 
                 service.GetActiveRequestCount() < maxConcurrentRequests &&
                 service.GetCacheSize() < maxCacheSize;
```

## 🔄 Caching Strategy

### Cache Configuration

```csharp
[Header("Configuration")]
public bool enableCaching = true;
public int cacheSize = 100;
public float cacheExpirationTime = 300f; // 5 minutes
```

### Cache Management

```csharp
// Clear cache when needed
service.ClearCache();

// Monitor cache performance
var hitRate = service.GetCacheHitRate();
var cacheSize = service.GetCacheSize();
```

## 🚀 Deployment

### Unity Build Process

1. **API Changes Only** - Deploy through normal CI/CD
2. **UI Changes** - Require separate UI deployment pipeline
3. **Configuration** - Update through environment variables

### Environment Configuration

```csharp
// Production settings
mcpServerUrl = "https://api.blazesportsintel.com/context7";
apiKey = Environment.GetEnvironmentVariable("CONTEXT7_API_KEY");
maxTokenLimit = 10000;
```

## 🐛 Troubleshooting

### Common Issues

1. **Service Not Initialized**
   ```csharp
   if (!Context7Service.Instance.IsConnected())
   {
       Debug.LogError("Context7Service not connected");
   }
   ```

2. **Cache Issues**
   ```csharp
   service.ClearCache();
   // Check cache configuration
   ```

3. **API Errors**
   ```csharp
   Context7Signals.ErrorOccurred.Subscribe(error => {
       Debug.LogError($"Context7 Error: {error}");
   });
   ```

### Debug Mode

Enable debug logging:

```csharp
#if UNITY_EDITOR
    Debug.Log($"[Context7] API Request: {libraryId} - {topic}");
#endif
```

## 📚 Additional Resources

- [Unity Contextual Tooling Documentation](https://docs.unity3d.com/Packages/com.unity.dt.app-ui@0.5/manual/contexts.html)
- [Context7 MCP Documentation](https://context7.com/api/v1)
- [Blaze Sports Intel API Docs](https://blazesportsintel.com/api-docs)

## 🤝 Contributing

### For API Changes
1. Work in `unity-app/Assets/Scripts/Context7/`
2. Follow singleton pattern
3. Use signals for communication
4. Add comprehensive error handling
5. Include performance monitoring

### For UI Changes
1. Create separate UI branch
2. Add required labels
3. Get design approval
4. Test thoroughly
5. Document changes

---

**Remember**: Keep API and UI work completely separate. The Context7 integration is designed to support this separation while providing powerful documentation and context management capabilities.