#!/bin/bash

echo "🔍 Testing Figma Dev Mode MCP Server Connection..."

# Check if Figma MCP server is running
if curl -s -f "http://127.0.0.1:3845/mcp" > /dev/null 2>&1; then
    echo "✅ Figma MCP Server is running at http://127.0.0.1:3845/mcp"
else
    echo "❌ Figma MCP Server is not running"
    echo ""
    echo "📝 To fix this:"
    echo "1. Open Figma Desktop App"
    echo "2. Go to Figma Menu > Preferences"
    echo "3. Enable 'Dev Mode MCP Server'"
    echo "4. Verify the server starts successfully"
    echo ""
    echo "📚 Read FIGMA_SETUP.md for detailed instructions"
fi

echo ""
echo "🔧 MCP Configuration Status:"

if [ -f ".vscode/settings.json" ]; then
    echo "✅ VS Code settings configured"
else
    echo "❌ VS Code settings missing"
fi

if [ -f "mcp.json" ]; then
    echo "✅ MCP configuration file exists"
else
    echo "❌ MCP configuration file missing"
fi

if [ -f "rules/figma-dev-mode-rules.md" ]; then
    echo "✅ Design system rules configured"
else
    echo "❌ Design system rules missing"
fi

echo ""
echo "💡 To test MCP integration:"
echo "1. Open VS Code in this workspace"
echo "2. Use ⌥⌘B or ⌃⌘I to open Copilot Chat"
echo "3. Switch to Agent mode"
echo "4. Type '#get_code' to verify tools are available"
echo ""
echo "📖 Full setup guide: FIGMA_SETUP.md"
