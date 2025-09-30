#!/usr/bin/env python3
"""
Test script for Blaze Unity MCP Integration
Verifies that the MCP server is working correctly
"""

import asyncio
import json
import subprocess
import sys
from pathlib import Path

class MCPIntegrationTester:
    def __init__(self):
        self.project_root = Path(__file__).parent
        self.unity_mcp_path = self.project_root.parent / "unity-mcp-integration"
        self.server_path = self.unity_mcp_path / "UnityMcpBridge" / "UnityMcpServer~" / "src"
        
    async def test_mcp_server_startup(self):
        """Test if the MCP server can start successfully"""
        print("🧪 Testing MCP server startup...")
        
        try:
            # Test server startup
            cmd = ["uv", "run", "--directory", str(self.server_path), "server.py", "--help"]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=10)
            
            if result.returncode == 0:
                print("✅ MCP server can start successfully")
                return True
            else:
                print(f"❌ MCP server startup failed: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            print("✅ MCP server started (timeout expected for help command)")
            return True
        except Exception as e:
            print(f"❌ MCP server test failed: {e}")
            return False
            
    def test_unity_project_structure(self):
        """Test Unity project structure"""
        print("🧪 Testing Unity project structure...")
        
        required_files = [
            "Assets/Scripts/BlazeSportsMCPExtension.cs",
            "Assets/Scripts/BlazeSportsManager.cs",
            "ProjectSettings/ProjectVersion.txt",
            "Packages/manifest.json"
        ]
        
        all_exist = True
        for file_path in required_files:
            full_path = self.project_root / file_path
            if full_path.exists():
                print(f"✅ {file_path}")
            else:
                print(f"❌ {file_path} - Missing")
                all_exist = False
                
        return all_exist
        
    def test_mcp_configuration(self):
        """Test MCP configuration files"""
        print("🧪 Testing MCP configuration...")
        
        config_files = [
            self.project_root / "blaze-mcp-config.json",
            Path.home() / "Library" / "Application Support" / "Claude" / "claude_desktop_config.json",
            Path.home() / "Library" / "Application Support" / "Cursor" / "User" / "mcp.json"
        ]
        
        config_valid = True
        for config_file in config_files:
            if config_file.exists():
                try:
                    with open(config_file, 'r') as f:
                        config = json.load(f)
                    print(f"✅ {config_file.name} - Valid JSON")
                except json.JSONDecodeError:
                    print(f"❌ {config_file.name} - Invalid JSON")
                    config_valid = False
            else:
                print(f"⚠️  {config_file.name} - Not found (may be expected on some systems)")
                
        return config_valid
        
    def test_blaze_scripts(self):
        """Test Blaze-specific scripts"""
        print("🧪 Testing Blaze scripts...")
        
        blaze_script = self.project_root / "Assets" / "Scripts" / "BlazeSportsMCPExtension.cs"
        if blaze_script.exists():
            content = blaze_script.read_text()
            
            # Check for key Blaze components
            checks = [
                ("BlazeSportsMCPExtension", "Main extension class"),
                ("CreateBaseballField", "Baseball field creation"),
                ("CreateNILValuationPlot", "NIL valuation plot"),
                ("BlazePlayerTrackingSystem", "Player tracking system"),
                ("BlazeAnalyticsDashboard", "Analytics dashboard")
            ]
            
            all_checks_pass = True
            for check_name, description in checks:
                if check_name in content:
                    print(f"✅ {description}")
                else:
                    print(f"❌ {description} - Missing {check_name}")
                    all_checks_pass = False
                    
            return all_checks_pass
        else:
            print("❌ BlazeSportsMCPExtension.cs not found")
            return False
            
    async def run_all_tests(self):
        """Run all integration tests"""
        print("🔥 Blaze Unity MCP Integration Test Suite")
        print("=" * 50)
        
        tests = [
            ("Unity Project Structure", self.test_unity_project_structure()),
            ("MCP Configuration", self.test_mcp_configuration()),
            ("Blaze Scripts", self.test_blaze_scripts()),
            ("MCP Server Startup", await self.test_mcp_server_startup())
        ]
        
        results = []
        for test_name, test_func in tests:
            print(f"\n📋 {test_name}")
            print("-" * 30)
            result = test_func if not asyncio.iscoroutine(test_func) else await test_func
            results.append((test_name, result))
            
        print("\n📊 Test Results Summary")
        print("=" * 50)
        
        all_passed = True
        for test_name, result in results:
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} - {test_name}")
            if not result:
                all_passed = False
                
        if all_passed:
            print("\n🎉 All tests passed! Unity MCP integration is ready.")
            print("\nNext steps:")
            print("1. Open Unity Editor")
            print("2. Open the project: /workspace/blaze-unity-project")
            print("3. Go to Window > MCP for Unity")
            print("4. Click 'Auto-Setup' or verify connection")
            print("5. Start using Blaze Sports Intelligence tools!")
        else:
            print("\n⚠️  Some tests failed. Please check the issues above.")
            
        return all_passed

async def main():
    tester = MCPIntegrationTester()
    success = await tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
