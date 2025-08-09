# 🎨 Figma Dev Mode MCP Server Setup Guide

## Prerequisites ✅

Before setting up the Figma Dev Mode MCP Server, ensure you have:

1. **Figma Desktop App** - Download from [figma.com/downloads](https://www.figma.com/downloads/)
2. **VS Code with GitHub Copilot** - Must have an active Copilot subscription
3. **SamurAI Dojo Project** - Your MERN stack project (this repository)

## Step-by-Step Setup

### 1. Enable MCP Server in Figma Desktop

1. **Open Figma Desktop App** and ensure it's updated to the latest version
2. **Open your SamurAI Dojo design file** (or create one)
3. **Open Figma menu** (upper-left corner)
4. **Go to Preferences**
5. **Select "Enable Dev Mode MCP Server"**
6. **Confirm the server is running** - You should see a message at the bottom

The server will run at: `http://127.0.0.1:3845/mcp`

### 2. Configure VS Code MCP Client

The MCP configuration has been automatically created in your project:

- ✅ `.vscode/settings.json` - VS Code workspace settings
- ✅ `mcp.json` - MCP server configuration
- ✅ `rules/figma-dev-mode-rules.md` - Design system rules for consistent code generation

### 3. Verify Connection

1. **Restart VS Code** to load the new MCP configuration
2. **Open the chat toolbar** using `⌥⌘B` or `⌃⌘I`
3. **Switch to Agent mode**
4. **Type `#get_code`** to confirm MCP tools are available
5. **If no tools appear**, restart both Figma and VS Code

## Using the MCP Server

### Method 1: Selection-Based (Recommended)

1. **Select a frame or component** in Figma Desktop
2. **In VS Code chat**, ask: *"Generate React code for my Figma selection using our SamurAI Dojo design system"*

### Method 2: Link-Based

1. **Copy a Figma link** (right-click → Copy link)
2. **In VS Code chat**, ask: *"Generate React code for this Figma design: [paste link]"*

## Available MCP Tools

### `get_code` 🔧
Generates React + Tailwind code from your Figma selection

**Example prompts:**
- *"Generate my Figma selection as a React component for the SamurAI Dojo auth flow"*
- *"Convert this Figma frame to a signup form component"*
- *"Create a dashboard component from my Figma selection"*

### `get_variable_defs` 🎨
Extracts design tokens (colors, spacing, typography)

**Example prompts:**
- *"Get all design variables from my Figma selection"*
- *"What colors and spacing tokens are used in this design?"*

### `get_image` 📸
Takes screenshots for layout fidelity (enable in Figma preferences)

### `create_design_system_rules` 📋
Creates custom rules for your design system

## SamurAI Dojo Specific Guidelines

### Authentication Components
- Focus on corporate, professional design
- Use security-themed visual elements
- Implement proper form validation states
- Follow the blue gradient color scheme

### Profiling Wizard
- Create step-by-step wizard components
- Implement progress indicators
- Use card-based layouts
- Include AI suggestion elements

### Dashboard Components
- Build workspace management interfaces
- Implement RBAC permission indicators
- Create team collaboration elements
- Use modern data visualization patterns

## Best Practices for SamurAI Dojo

### 1. Structure Your Figma File
- ✅ Use components for reusable elements (buttons, cards, forms)
- ✅ Name layers semantically (`AuthForm`, not `Group 5`)
- ✅ Use Auto Layout for responsive behavior
- ✅ Apply consistent spacing and colors

### 2. Effective Prompting
```
Good: "Generate a corporate login form component using our auth design system with proper validation states"

Better: "Generate a corporate login form component for SamurAI Dojo with:
- Corporate email validation
- Professional blue gradient styling
- Security-focused visual elements
- Proper error and loading states
- Tailwind CSS styling
- Integration with our authStore"
```

### 3. Component Organization
Generated components should go in:
- **UI Components**: `frontend/src/components/ui/`
- **Auth Components**: `frontend/src/components/auth/`
- **Dashboard Components**: `frontend/src/components/dashboard/`
- **Wizard Components**: `frontend/src/components/wizard/`

### 4. Integration with Existing Code
Always specify:
- Use existing Zustand stores (`authStore`, `userStore`, etc.)
- Follow existing API patterns
- Implement proper TypeScript interfaces
- Include accessibility features

## Troubleshooting

### MCP Server Not Connecting
1. **Restart Figma Desktop** - Ensure the server is running
2. **Check VS Code Extensions** - GitHub Copilot must be enabled
3. **Verify Configuration** - Check `mcp.json` and `.vscode/settings.json`
4. **Restart VS Code** - Reload the MCP configuration

### No Tools Available
1. **Type `#get_code`** in VS Code chat to check tool availability
2. **Ensure Agent mode** is enabled in the chat
3. **Check Figma version** - Must be latest desktop version
4. **Verify Copilot subscription** - Required for MCP in VS Code

### Poor Code Quality
1. **Review design system rules** - Check `rules/figma-dev-mode-rules.md`
2. **Structure Figma file** - Use components and proper naming
3. **Improve prompts** - Be specific about requirements
4. **Break down selections** - Generate smaller components first

## Example Workflow

1. **Design Authentication Flow** in Figma
2. **Select Login Form** frame in Figma
3. **Generate Component**: *"Create a React login form component for SamurAI Dojo with corporate styling and authStore integration"*
4. **Review and Refine** the generated code
5. **Save to** `frontend/src/components/auth/LoginForm.jsx`
6. **Integrate** with existing routing and state management

## Next Steps

With the MCP server configured, you can now:

1. **Design your SamurAI Dojo interfaces** in Figma
2. **Generate React components** directly from designs
3. **Maintain design-code consistency** automatically
4. **Speed up development** with AI-powered code generation

Happy designing and coding! 🎨⚡
