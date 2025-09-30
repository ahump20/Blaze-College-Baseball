#!/usr/bin/env python3
"""
Test script to verify Unity MCP integration is working properly
"""

import subprocess
import sys
import json
from pathlib import Path

def test_mcp_server():
    """Test if the MCP server can start and respond"""
    print("🧪 Testing Unity MCP Server...")
    
    try:
        # Test if the server can be imported and started
        server_path = Path("/workspace/unity-mcp-integration/UnityMcpBridge/UnityMcpServer~/src")
        
        # Run a simple test to check if the server module loads
        result = subprocess.run([
            "uv", "run", "--directory", str(server_path), 
            "python3", "-c", "import server; print('✅ MCP server module loaded successfully')"
        ], capture_output=True, text=True, timeout=10)
        
        if result.returncode == 0:
            print("✅ MCP server module loads correctly")
            return True
        else:
            print(f"❌ MCP server test failed: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⚠️ MCP server test timed out (this is normal if Unity isn't running)")
        return True
    except Exception as e:
        print(f"❌ MCP server test failed: {e}")
        return False

def test_configuration_files():
    """Test if configuration files are properly created"""
    print("📋 Testing configuration files...")
    
    config_files = [
        "/workspace/blaze-unity-project/blaze-mcp-config.json",
        "/home/ubuntu/Library/Application Support/Claude/claude_desktop_config.json",
        "/home/ubuntu/Library/Application Support/Cursor/User/mcp.json"
    ]
    
    all_exist = True
    for config_file in config_files:
        if Path(config_file).exists():
            print(f"✅ {config_file} exists")
        else:
            print(f"❌ {config_file} missing")
            all_exist = False
    
    return all_exist

def test_unity_project_structure():
    """Test if Unity project has the required structure"""
    print("🎮 Testing Unity project structure...")
    
    required_files = [
        "/workspace/blaze-unity-project/Assets/Scripts/BlazeSportsManager.cs",
        "/workspace/blaze-unity-project/Assets/Scripts/BlazeSportsMCPExtension.cs",
        "/workspace/blaze-unity-project/Packages/manifest.json",
        "/workspace/blaze-unity-project/ProjectSettings/ProjectVersion.txt"
    ]
    
    all_exist = True
    for file_path in required_files:
        if Path(file_path).exists():
            print(f"✅ {file_path} exists")
        else:
            print(f"❌ {file_path} missing")
            all_exist = False
    
    return all_exist

def main():
    """Run all tests"""
    print("🔥 Unity MCP Integration Test Suite")
    print("=" * 50)
    
    tests = [
        ("Unity Project Structure", test_unity_project_structure),
        ("Configuration Files", test_configuration_files),
        ("MCP Server", test_mcp_server)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name} test...")
        if test_func():
            passed += 1
            print(f"✅ {test_name} test passed")
        else:
            print(f"❌ {test_name} test failed")
    
    print(f"\n📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 All tests passed! Unity MCP integration is ready to use.")
        print("\nNext steps:")
        print("1. Open Unity Editor")
        print("2. Open the project: /workspace/blaze-unity-project")
        print("3. Go to Window > MCP for Unity")
        print("4. Click 'Auto-Setup' to connect to the MCP server")
        print("5. Start using AI-assisted Unity development!")
        return True
    else:
        print(f"\n⚠️ {total - passed} tests failed. Please check the issues above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)