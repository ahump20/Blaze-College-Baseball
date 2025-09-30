# 🔥 Blaze Sports Intelligence Unity MCP Deployment Guide

## ✅ Setup Complete!

Your Unity MCP integration with Blaze Sports Intelligence is now fully configured and ready to use.

## 🚀 Quick Start

### 1. Open Unity Project
```bash
# Navigate to your Unity project
cd /workspace/blaze-unity-project

# Open Unity Hub and add this folder as a project
# Or open directly: unity /workspace/blaze-unity-project
```

### 2. Install Unity MCP Package
1. In Unity Editor, go to `Window > Package Manager`
2. Click `+` → `Add package from git URL...`
3. Enter: `https://github.com/CoplayDev/unity-mcp.git?path=/UnityMcpBridge`
4. Click `Add`

### 3. Configure MCP Connection
1. In Unity, go to `Window > MCP for Unity`
2. Click `Auto-Setup`
3. Look for green status indicator 🟢 and "Connected ✓"

### 4. Start Using Blaze Tools
Open your MCP client (Claude, Cursor, or VSCode) and start using commands like:

```
Create a 3D baseball field with Blaze Intelligence tracking system
```

## 🎮 Available Blaze Sports Intelligence Tools

### 🏟️ 3D Sports Visualization
- **Baseball Field Creator**: Interactive 3D baseball fields with real-time tracking
- **Player Tracking System**: Advanced sports analytics integration
- **Performance Analytics**: Real-time player performance monitoring

### 📊 NIL Analytics
- **3D Valuation Plots**: Interactive NIL (Name, Image, Likeness) analytics
- **Market Data Integration**: Real-time valuation data
- **Player Comparison Tools**: Side-by-side NIL analysis

### 🏃 Biomechanics Analysis
- **Motion Capture Integration**: Sports performance analysis
- **3D Motion Visualization**: Biomechanical data visualization
- **Performance Optimization**: AI-powered recommendations

### 📈 Real-time Dashboard
- **Live Sports Data**: Real-time analytics feeds
- **Custom Metrics**: Configurable performance indicators
- **Export Capabilities**: Report generation and data export

## 🔧 Configuration Files

### MCP Client Configurations
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: `~/Library/Application Support/Cursor/User/mcp.json`
- **VSCode**: `~/Library/Application Support/Code/User/mcp.json`

### Environment Variables
```bash
BLAZE_PROJECT_PATH=/workspace/blaze-unity-project
BLAZE_ANALYTICS_ENABLED=true
BLAZE_SPORTS_MODE=true
MCP_WEBSOCKET_PORT=5010
```

## 🧪 Testing Your Setup

Run the integration test suite:
```bash
cd /workspace/blaze-unity-project
python3 test-mcp-integration.py
```

## 📝 Example Commands

### Create Sports Visualizations
```
Create a professional baseball field with real-time player tracking and analytics dashboard
```

### Generate NIL Analytics
```
Create an interactive 3D NIL valuation scatter plot with 200 data points showing market trends
```

### Analyze Performance
```
Analyze baseball swing biomechanics data and create performance optimization recommendations
```

### Build Dashboard
```
Create a real-time sports analytics dashboard for baseball with custom performance metrics
```

## 🛠️ Troubleshooting

### Unity MCP Not Connecting
1. Ensure Unity Editor is open
2. Check status in `Window > MCP for Unity`
3. Restart Unity Editor
4. Verify MCP server is running: `uv run server.py --directory UnityMcpServer/src`

### MCP Client Issues
1. Check configuration file paths are correct
2. Verify `uv` is installed and accessible
3. Restart your MCP client after configuration changes

### Blaze Integration Issues
1. Verify API endpoints are accessible
2. Check environment variables are set correctly
3. Ensure proper authentication tokens (if required)

## 📊 Project Structure

```
blaze-unity-project/
├── Assets/
│   ├── Scripts/
│   │   ├── BlazeSportsMCPExtension.cs    # Main Blaze MCP extension
│   │   └── BlazeSportsManager.cs         # Blaze Sports manager
│   ├── Scenes/                           # Unity scenes
│   ├── Materials/                        # Materials and textures
│   ├── Prefabs/                          # Prefabricated objects
│   └── Shaders/                          # Custom shaders
├── ProjectSettings/                      # Unity project settings
├── Packages/                             # Unity packages
│   └── manifest.json                     # Package dependencies
├── setup-blaze-mcp.py                   # Setup script
├── test-mcp-integration.py              # Integration tests
├── blaze-mcp-config.json                # MCP configuration
└── README.md                            # Documentation
```

## 🔄 Updating the Integration

To update your Unity MCP integration:

1. Pull latest changes from the repository
2. Re-run the setup script: `python3 setup-blaze-mcp.py`
3. Update Unity packages in Package Manager
4. Restart Unity Editor

## 🎯 Next Steps

1. **Explore Blaze Tools**: Try creating different sports visualizations
2. **Customize Analytics**: Modify metrics and data sources
3. **Integrate APIs**: Connect to your Blaze Sports Intelligence backend
4. **Extend Functionality**: Add new sports analytics tools
5. **Share Results**: Export visualizations and reports

## 🆘 Support

- **Discord**: [Unity MCP Discord](https://discord.gg/y4p8KfzrN4)
- **Issues**: [GitHub Issues](https://github.com/CoplayDev/unity-mcp/issues)
- **Documentation**: [Unity MCP Docs](https://github.com/CoplayDev/unity-mcp)

---

**🔥 Blaze Sports Intelligence Unity MCP Integration - Ready for Action!**

*Transform your sports analytics with AI-assisted Unity development*
