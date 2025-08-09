#!/bin/bash

echo "🎨 SamurAI Dojo Figma Integration Setup"
echo "======================================="
echo ""

# Check if Figma Desktop is installed
if ! command -v figma &> /dev/null && ! open -Ra "Figma" 2>/dev/null; then
    echo "❌ Figma Desktop App not found"
    echo "📥 Please download and install Figma Desktop from:"
    echo "   https://www.figma.com/downloads/"
    echo ""
    echo "After installation, run this script again."
    exit 1
fi

echo "✅ Figma Desktop App found"

# Check VS Code and Copilot
if ! command -v code &> /dev/null; then
    echo "❌ VS Code not found in PATH"
    echo "Please install VS Code or add it to your PATH"
    exit 1
fi

echo "✅ VS Code found"

# Check Copilot extensions
COPILOT_INSTALLED=$(code --list-extensions | grep -c "github.copilot")
if [ "$COPILOT_INSTALLED" -eq 0 ]; then
    echo "❌ GitHub Copilot extension not found"
    echo "📦 Installing GitHub Copilot..."
    code --install-extension GitHub.copilot
    code --install-extension GitHub.copilot-chat
else
    echo "✅ GitHub Copilot extensions installed"
fi

echo ""
echo "🔧 MCP Configuration Status:"

# Check configuration files
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
echo "📋 Next Steps to Enable MCP Server:"
echo ""
echo "1. 🖥️  Open Figma Desktop App"
echo "2. 📂 Open your SamurAI Dojo design file:"
echo "   https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-"
echo ""
echo "3. ⚙️  Enable MCP Server:"
echo "   • Click Figma menu (upper-left corner)"
echo "   • Go to Preferences"
echo "   • Select 'Enable Dev Mode MCP Server'"
echo "   • Wait for confirmation message"
echo ""
echo "4. 🔗 Add MCP Server to VS Code:"
echo "   • Open VS Code"
echo "   • Press ⌘+Shift+P"
echo "   • Search 'MCP: Add Server'"
echo "   • Select 'HTTP'"
echo "   • Enter URL: http://127.0.0.1:3845/mcp"
echo "   • Enter Server ID: Figma Dev Mode MCP"
echo ""
echo "5. ✅ Test Connection:"
echo "   • Open VS Code chat (⌥⌘B or ⌃⌘I)"
echo "   • Switch to Agent mode"
echo "   • Type: #get_code"
echo "   • Should see MCP tools listed"
echo ""
echo "6. 🚀 Generate Components:"
echo "   • Select a frame in Figma"
echo "   • In VS Code chat, ask:"
echo "   'Generate React code for my Figma selection using SamurAI Dojo design system'"
echo ""

# Test MCP server if it's running
if curl -s -f "http://127.0.0.1:3845/mcp" > /dev/null 2>&1; then
    echo "🎉 Figma MCP Server is already running!"
    echo "✅ Server URL: http://127.0.0.1:3845/mcp"
    echo ""
    echo "Ready to generate components from your designs! 🚀"
else
    echo "⏳ Waiting for you to enable MCP server in Figma..."
    echo ""
    echo "Run './test-mcp.sh' after setup to verify connection"
fi

echo ""
echo "📚 Documentation:"
echo "   • Full setup guide: FIGMA_SETUP.md"
echo "   • Design system rules: rules/figma-dev-mode-rules.md"
echo "   • Project overview: README.md"
