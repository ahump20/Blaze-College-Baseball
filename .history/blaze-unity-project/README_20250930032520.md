# Blaze Sports Intelligence Unity MCP Integration

🔥 **Professional Unity MCP integration with advanced sports analytics capabilities**

This project integrates Unity with the Model Context Protocol (MCP) to enable AI-assisted Unity development with specialized sports analytics and visualization tools.

## Features

### 🎮 Unity MCP Integration
- **Natural Language Control**: Instruct AI assistants to perform Unity tasks
- **Powerful Tools**: Manage assets, scenes, materials, scripts, and editor functions
- **Automation**: Automate repetitive Unity workflows
- **Extensible**: Works with various MCP Clients (Claude, Cursor, VSCode)

### 🏈 Blaze Sports Intelligence Tools
- **3D Baseball Field Visualization**: Interactive field with real-time player tracking
- **NIL Valuation 3D Plots**: Name, Image, Likeness analytics visualization
- **Biomechanics Analysis**: Sports performance analysis with motion capture
- **Real-time Analytics Dashboard**: Live sports data visualization
- **Player Tracking System**: Advanced sports analytics integration

## Prerequisites

- **Python**: Version 3.12 or newer
- **Unity**: Version 2021.3 LTS or newer
- **uv**: Python toolchain manager
- **MCP Client**: Claude Desktop, Cursor, or VSCode

## Quick Setup

### 1. Run the Setup Script

```bash
cd /workspace/blaze-unity-project
python3 setup-blaze-mcp.py
```

This script will:
- Check prerequisites
- Set up Unity project structure
- Configure MCP clients automatically
- Create Blaze-specific Unity scripts

### 2. Open Unity Project

1. Open Unity Hub
2. Add the project folder: `/workspace/blaze-unity-project`
3. Open the project in Unity Editor

### 3. Install MCP Package

1. In Unity, go to `Window > Package Manager`
2. Click `+` → `Add package from git URL...`
3. Enter: `https://github.com/CoplayDev/unity-mcp.git?path=/UnityMcpBridge`
4. Click `Add`

### 4. Configure MCP Connection

1. In Unity, go to `Window > MCP for Unity`
2. Click `Auto-Setup`
3. Look for green status indicator 🟢 and "Connected ✓"

## Usage Examples

### Create Baseball Field with Tracking
```
Create a 3D baseball field with Blaze Intelligence player tracking system
```

### Generate NIL Valuation Plot
```
Create an interactive 3D NIL valuation scatter plot with 200 data points
```

### Analyze Biomechanics
```
Analyze baseball swing biomechanics data and create performance recommendations
```

### Build Sports Dashboard
```
Create a real-time sports analytics dashboard for baseball with performance metrics
```

## Blaze Sports Intelligence Features

### 🏟️ 3D Sports Visualization
- Interactive baseball fields with real-time tracking
- Player position monitoring and analytics
- Performance metrics overlay
- Historical data visualization

### 📊 NIL Analytics
- 3D scatter plots for Name, Image, Likeness valuation
- Real-time market data integration
- Player comparison tools
- Valuation trend analysis

### 🏃 Biomechanics Analysis
- Motion capture data processing
- Performance optimization recommendations
- 3D motion visualization
- Professional standard comparisons

### 📈 Real-time Dashboard
- Live sports data feeds
- Custom metric configuration
- Export capabilities
- Predictive analytics

## Project Structure

```
blaze-unity-project/
├── Assets/
│   ├── Scripts/
│   │   ├── BlazeSportsMCPExtension.cs
│   │   └── BlazeSportsManager.cs
│   ├── Scenes/
│   ├── Materials/
│   ├── Prefabs/
│   └── Shaders/
├── ProjectSettings/
├── Packages/
├── setup-blaze-mcp.py
├── blaze-mcp-config.json
└── README.md
```

## Configuration Files

### MCP Client Configuration
The setup script automatically configures:
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Cursor**: `~/Library/Application Support/Cursor/User/mcp.json`
- **VSCode**: `~/Library/Application Support/Code/User/mcp.json`

### Environment Variables
- `BLAZE_PROJECT_PATH`: Unity project path
- `BLAZE_ANALYTICS_ENABLED`: Enable analytics tracking
- `BLAZE_SPORTS_MODE`: Enable sports-specific features
- `MCP_WEBSOCKET_PORT`: MCP server port (default: 5010)

## Troubleshooting

### Unity MCP Not Connecting
1. Ensure Unity Editor is open
2. Check status in `Window > MCP for Unity`
3. Restart Unity Editor
4. Verify MCP server is running

### MCP Client Issues
1. Check configuration file paths
2. Verify `uv` is installed and accessible
3. Run server manually: `uv run server.py --directory UnityMcpServer/src`

### Blaze Integration Issues
1. Verify API endpoints are accessible
2. Check environment variables
3. Ensure proper authentication tokens

## Development

### Adding New Blaze Tools
1. Extend `BlazeSportsMCPExtension.cs`
2. Add new menu items for Unity Editor
3. Create corresponding MCP server functions
4. Update configuration as needed

### Custom Sports Analytics
1. Modify `BlazeSportsManager.cs`
2. Add new analytics modules
3. Integrate with Blaze Sports Intelligence API
4. Create visualization components

## Support

- **Discord**: Join our [Unity MCP Discord](https://discord.gg/y4p8KfzrN4)
- **Issues**: [GitHub Issues](https://github.com/CoplayDev/unity-mcp/issues)
- **Documentation**: [Unity MCP Docs](https://github.com/CoplayDev/unity-mcp)

## License

MIT License - See [LICENSE](LICENSE) file for details.

---

**Powered by Blaze Sports Intelligence** 🔥

*Transforming sports analytics through AI-assisted Unity development*
