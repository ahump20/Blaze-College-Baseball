# Unity Sports Analytics Application with Context7 Integration

This Unity application integrates with Context7 to provide real-time documentation and assistance for sports analytics development, specifically designed for the Blaze Sports Intelligence platform.

## Features

- **Context7 Integration**: Real-time access to Unity and sports analytics documentation
- **Sports Analytics Visualization**: 3D visualization of biomechanical data
- **Real-time Documentation**: In-editor documentation lookup
- **MCP Server Communication**: Direct communication with Context7 MCP server
- **Sports Data Processing**: Integration with BSI backend for real-time data

## Prerequisites

- Unity 2022.3 LTS or later
- Node.js 18+ (for Context7 MCP server)
- .NET 6.0 or later

## Setup

1. **Install Context7 MCP Server**:
   ```bash
   npx -y @smithery/cli@latest install @upstash/context7-mcp --client Unity
   ```

2. **Start Context7 MCP Server**:
   ```bash
   # The server will run on localhost:8080 by default
   ```

3. **Open Unity Project**:
   - Open Unity Hub
   - Add existing project from this directory
   - Open the project

## Project Structure

```
unity-app/
├── Assets/
│   ├── Scripts/
│   │   ├── Context7/
│   │   │   ├── Context7Integration.cs
│   │   │   ├── MCPClient.cs
│   │   │   └── DocumentationManager.cs
│   │   ├── SportsAnalytics/
│   │   │   ├── BiomechanicsVisualizer.cs
│   │   │   ├── DataProcessor.cs
│   │   │   └── SportsDataManager.cs
│   │   └── UI/
│   │       ├── DocumentationPanel.cs
│   │       └── AnalyticsDashboard.cs
│   ├── Scenes/
│   │   ├── MainScene.unity
│   │   └── DocumentationDemo.unity
│   └── Prefabs/
│       ├── Context7Panel.prefab
│       └── AnalyticsVisualizer.prefab
├── ProjectSettings/
└── Packages/
```

## Usage

1. **Documentation Lookup**: Use the in-editor panel to search for Unity or sports analytics documentation
2. **Real-time Data**: Connect to the BSI backend for live sports data
3. **3D Visualization**: View biomechanical data in 3D space
4. **Code Assistance**: Get real-time code examples and best practices

## API Integration

The application integrates with the BSI backend API endpoints:
- `/api/pose-data` - Real-time pose detection data
- `/api/biomechanics` - Biomechanical analysis results
- `/api/analytics` - Sports analytics metrics

## Development

This Unity application is designed to work alongside the existing BSI platform, providing a 3D visualization and development environment for sports analytics.