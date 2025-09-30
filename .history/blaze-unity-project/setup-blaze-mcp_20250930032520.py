#!/usr/bin/env python3
"""
Blaze Sports Intelligence Unity MCP Setup Script
Configures Unity MCP integration with Blaze-specific tools and capabilities
"""

import os
import json
import sys
import subprocess
from pathlib import Path

class BlazeMCPSetup:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.unity_mcp_path = self.project_root.parent / "unity-mcp-integration"
        self.server_path = self.unity_mcp_path / "UnityMcpBridge" / "UnityMcpServer~"
        
    def check_prerequisites(self):
        """Check if all prerequisites are installed"""
        print("🔍 Checking prerequisites...")
        
        # Check Python version
        if sys.version_info < (3, 12):
            print("❌ Python 3.12 or higher is required")
            return False
            
        # Check if uv is installed
        try:
            subprocess.run(["uv", "--version"], check=True, capture_output=True)
            print("✅ uv is installed")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ uv is not installed. Please install it first:")
            print("   curl -LsSf https://astral.sh/uv/install.sh | sh")
            return False
            
        # Check if Unity MCP is available
        if not self.server_path.exists():
            print("❌ Unity MCP server not found. Please clone the repository first.")
            return False
            
        print("✅ All prerequisites met")
        return True
        
    def create_blaze_mcp_config(self):
        """Create Blaze-specific MCP configuration"""
        print("⚙️ Creating Blaze MCP configuration...")
        
        # Determine server path based on OS
        if os.name == 'nt':  # Windows
            server_dir = str(self.server_path / "src").replace("\\", "\\\\")
            uv_command = "C:\\Users\\%USERNAME%\\AppData\\Local\\Microsoft\\WinGet\\Links\\uv.exe"
        else:  # macOS/Linux
            server_dir = str(self.server_path / "src")
            uv_command = "uv"
            
        config = {
            "mcpServers": {
                "unity-blaze-mcp": {
                    "command": uv_command,
                    "args": [
                        "run",
                        "--directory",
                        server_dir,
                        "server.py"
                    ],
                    "env": {
                        "BLAZE_PROJECT_PATH": str(self.project_root),
                        "BLAZE_ANALYTICS_ENABLED": "true",
                        "BLAZE_SPORTS_MODE": "true",
                        "MCP_WEBSOCKET_PORT": "5010",
                        "BLAZE_UNITY_INTEGRATION": "true"
                    }
                }
            }
        }
        
        # Save configuration
        config_path = self.project_root / "blaze-mcp-config.json"
        with open(config_path, 'w') as f:
            json.dump(config, f, indent=2)
            
        print(f"✅ Configuration saved to {config_path}")
        return config_path
        
    def create_claude_config(self):
        """Create Claude Desktop configuration"""
        print("📱 Creating Claude Desktop configuration...")
        
        # Get user home directory
        home = Path.home()
        
        # Determine OS-specific config path
        if os.name == 'nt':  # Windows
            config_dir = home / "AppData" / "Roaming" / "Claude"
        else:  # macOS
            config_dir = home / "Library" / "Application Support" / "Claude"
            
        config_dir.mkdir(parents=True, exist_ok=True)
        config_file = config_dir / "claude_desktop_config.json"
        
        # Load existing config or create new one
        if config_file.exists():
            with open(config_file, 'r') as f:
                config = json.load(f)
        else:
            config = {"mcpServers": {}}
            
        # Add Blaze MCP server
        blaze_config = self.create_blaze_mcp_config()
        with open(blaze_config, 'r') as f:
            blaze_mcp_config = json.load(f)
            
        config["mcpServers"].update(blaze_mcp_config["mcpServers"])
        
        # Save updated config
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
            
        print(f"✅ Claude configuration updated: {config_file}")
        return config_file
        
    def create_cursor_config(self):
        """Create Cursor configuration"""
        print("🎯 Creating Cursor configuration...")
        
        # Get user home directory
        home = Path.home()
        
        # Determine OS-specific config path
        if os.name == 'nt':  # Windows
            config_dir = home / "AppData" / "Roaming" / "Cursor" / "User"
        else:  # macOS
            config_dir = home / "Library" / "Application Support" / "Cursor" / "User"
            
        config_dir.mkdir(parents=True, exist_ok=True)
        config_file = config_dir / "mcp.json"
        
        # Load existing config or create new one
        if config_file.exists():
            with open(config_file, 'r') as f:
                config = json.load(f)
        else:
            config = {"servers": {}}
            
        # Add Blaze MCP server
        if "servers" not in config:
            config["servers"] = {}
            
        config["servers"]["unity-blaze-mcp"] = {
            "command": "uv",
            "args": [
                "run",
                "--directory",
                str(self.server_path / "src"),
                "server.py"
            ],
            "type": "stdio"
        }
        
        # Save updated config
        with open(config_file, 'w') as f:
            json.dump(config, f, indent=2)
            
        print(f"✅ Cursor configuration updated: {config_file}")
        return config_file
        
    def setup_unity_project(self):
        """Set up Unity project with Blaze MCP integration"""
        print("🎮 Setting up Unity project...")
        
        # Create necessary Unity directories
        assets_dir = self.project_root / "Assets"
        scripts_dir = assets_dir / "Scripts"
        
        scripts_dir.mkdir(parents=True, exist_ok=True)
        
        # Create Blaze-specific Unity scripts
        self.create_blaze_scripts()
        
        print("✅ Unity project setup complete")
        
    def create_blaze_scripts(self):
        """Create additional Blaze-specific Unity scripts"""
        print("📝 Creating Blaze Unity scripts...")
        
        # Create Blaze Sports Intelligence Manager
        blaze_manager_script = """
using UnityEngine;
using System.Collections.Generic;

namespace BlazeSports.Intelligence
{
    /// <summary>
    /// Main manager for Blaze Sports Intelligence integration
    /// </summary>
    public class BlazeSportsManager : MonoBehaviour
    {
        [Header("Blaze Configuration")]
        public string apiEndpoint = "https://blazesportsintel.com/api";
        public string apiKey = "";
        public bool enableRealTimeAnalytics = true;
        
        [Header("Analytics")]
        public int totalEvents = 0;
        public float averageResponseTime = 0f;
        
        private static BlazeSportsManager _instance;
        public static BlazeSportsManager Instance
        {
            get
            {
                if (_instance == null)
                {
                    _instance = FindObjectOfType<BlazeSportsManager>();
                    if (_instance == null)
                    {
                        var go = new GameObject("BlazeSportsManager");
                        _instance = go.AddComponent<BlazeSportsManager>();
                        DontDestroyOnLoad(go);
                    }
                }
                return _instance;
            }
        }
        
        void Awake()
        {
            if (_instance == null)
            {
                _instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else if (_instance != this)
            {
                Destroy(gameObject);
            }
        }
        
        void Start()
        {
            InitializeBlazeIntegration();
        }
        
        private void InitializeBlazeIntegration()
        {
            Debug.Log("[Blaze Intelligence] Initializing Blaze Sports Intelligence integration...");
            
            // Initialize analytics tracking
            if (enableRealTimeAnalytics)
            {
                StartCoroutine(UpdateAnalytics());
            }
        }
        
        private System.Collections.IEnumerator UpdateAnalytics()
        {
            while (true)
            {
                yield return new WaitForSeconds(1f);
                
                // Update analytics data
                totalEvents++;
                averageResponseTime = Time.time;
                
                Debug.Log($"[Blaze Intelligence] Analytics updated - Events: {totalEvents}, Response Time: {averageResponseTime:F2}s");
            }
        }
        
        public void LogSportsEvent(string eventType, Dictionary<string, object> data)
        {
            Debug.Log($"[Blaze Intelligence] Sports Event: {eventType}");
            
            // Here you would send data to your Blaze Sports Intelligence API
            // Example: await BlazeAPI.SendEvent(eventType, data);
        }
    }
}
"""
        
        # Save the script
        scripts_dir = self.project_root / "Assets" / "Scripts"
        with open(scripts_dir / "BlazeSportsManager.cs", 'w') as f:
            f.write(blaze_manager_script)
            
        print("✅ Blaze Unity scripts created")
        
    def run_setup(self):
        """Run the complete setup process"""
        print("🔥 Blaze Sports Intelligence Unity MCP Setup")
        print("=" * 50)
        
        if not self.check_prerequisites():
            print("❌ Setup failed due to missing prerequisites")
            return False
            
        try:
            self.setup_unity_project()
            self.create_claude_config()
            self.create_cursor_config()
            
            print("\n🎉 Setup Complete!")
            print("\nNext steps:")
            print("1. Open your Unity project")
            print("2. Go to Window > MCP for Unity")
            print("3. Click 'Auto-Setup' or verify the connection")
            print("4. Start using Blaze Sports Intelligence tools in your MCP client!")
            
            return True
            
        except Exception as e:
            print(f"❌ Setup failed: {e}")
            return False

if __name__ == "__main__":
    setup = BlazeMCPSetup()
    success = setup.run_setup()
    sys.exit(0 if success else 1)
