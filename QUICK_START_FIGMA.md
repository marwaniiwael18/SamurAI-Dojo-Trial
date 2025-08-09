# 🚀 Quick Start: Generate SamurAI Dojo Components

## Setup Checklist

### 1. Enable Figma MCP Server
- [x] ✅ Open Figma Desktop App
- [ ] 📂 Open design file: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-
- [ ] ⚙️ Figma Menu → Preferences → "Enable Dev Mode MCP Server"
- [ ] ✅ Wait for confirmation message

### 2. Configure VS Code MCP
- [ ] 🔗 VS Code: ⌘+Shift+P → "MCP: Add Server"
- [ ] 📡 Select "HTTP" → URL: `http://127.0.0.1:3845/mcp`
- [ ] 🏷️ Server ID: `Figma Dev Mode MCP`

### 3. Test Connection
```bash
# Test MCP server
./test-mcp.sh

# Should show: ✅ Figma MCP Server is running
```

## 🎯 Generate Your First Component

### Step 1: Start with HomePage
1. **Open Figma** → Navigate to: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=22-2&m=dev
2. **Select the HomePage frame** (node-id=22-2)
3. **In VS Code chat** (⌥⌘B), ask:

```
Generate React code for my Figma selection as the SamurAI Dojo HomePage with:
- Hero section with corporate branding
- Professional blue gradient styling (#3B82F6 to #1E40AF)
- Call-to-action buttons for signup/signin
- Responsive design for mobile and desktop
- Tailwind CSS styling
- Integration with React Router for navigation
- Save as frontend/src/pages/HomePage.jsx
```

### Step 2: Authentication Pages

#### Sign Up Page (node-id=63-2)
```
Generate React code for my Figma selection as the SamurAI Dojo SignUpPage with:
- Corporate email validation form
- Password strength requirements
- Integration with authStore.register()
- Professional security-focused styling
- Form validation with error states
- Loading states during registration
- Save as frontend/src/pages/SignUpPage.jsx
```

#### Sign In Page (node-id=66-75)
```
Generate React code for my Figma selection as the SamurAI Dojo SignInPage with:
- Corporate login form
- Integration with authStore.login()
- Remember me functionality
- Password reset link
- Account lockout protection UI
- Save as frontend/src/pages/SignInPage.jsx
```

### Step 3: Dashboard Components

#### Main Dashboard (node-id=66-198)
```
Generate React code for my Figma selection as the SamurAI Dojo Dashboard with:
- Header navigation with user profile
- Sidebar with workspace navigation
- Main content area with widgets
- Integration with userStore and workspaceStore
- RBAC-based permission display
- Save as frontend/src/pages/DashboardPage.jsx
```

## 🎨 Component Generation Order

**Priority 1: Core Pages**
1. ✅ HomePage (node-id=22-2)
2. ✅ SignUpPage (node-id=63-2)  
3. ✅ SignInPage (node-id=66-75)
4. ✅ DashboardPage (node-id=66-198)

**Priority 2: Profiling Wizard**
5. ProfileStep1 (node-id=66-145)
6. ProfileStep2 (node-id=108-2)
7. ProfileStep3 (node-id=111-20)

**Priority 3: Layout Components**
8. Header (node-id=1-3)
9. Sidebar (node-id=115-114)

**Priority 4: Feature Components**
10. WorkspaceOverview (node-id=73-177)
11. TeamManagement (node-id=73-295)
12. Analytics (node-id=140-7)

## 💡 Pro Tips

### Better Prompts
- **Be specific** about component purpose and integration
- **Mention authStore/userStore** for state management
- **Request TypeScript interfaces** for props
- **Ask for accessibility features** (ARIA, keyboard nav)
- **Specify file location** for proper organization

### Example Advanced Prompt
```
Generate React code for my Figma selection as a SamurAI Dojo [ComponentName] with:

FUNCTIONALITY:
- [Specific features needed]
- Integration with [specific store]
- [API endpoints to call]

STYLING:
- SamurAI Dojo blue gradient theme
- Corporate professional design
- Responsive mobile-first design
- Tailwind CSS utilities only

TECHNICAL:
- TypeScript interfaces for props
- Proper error handling and loading states
- Accessibility (ARIA labels, keyboard navigation)
- Follow existing project patterns

ORGANIZATION:
- Save as frontend/src/[path]/[ComponentName].jsx
- Import existing stores and utilities
- Follow our naming conventions
```

## 🔧 Troubleshooting

### MCP Server Issues
```bash
# Check if server is running
curl -s -f "http://127.0.0.1:3845/mcp"

# If not running:
# 1. Restart Figma Desktop
# 2. Re-enable MCP Server in Preferences
# 3. Wait for confirmation message
```

### VS Code Issues
```bash
# Check MCP tools availability
# In VS Code chat: #get_code
# Should show available tools

# If no tools:
# 1. Restart VS Code
# 2. Ensure Agent mode is enabled
# 3. Re-add MCP server if needed
```

## 📁 File Organization

Generated components should follow this structure:
```
frontend/src/
├── pages/
│   ├── HomePage.jsx           # node-id=22-2
│   ├── SignUpPage.jsx         # node-id=63-2
│   ├── SignInPage.jsx         # node-id=66-75
│   └── DashboardPage.jsx      # node-id=66-198
├── components/
│   ├── layout/
│   │   ├── Header.jsx         # node-id=1-3
│   │   └── Sidebar.jsx        # node-id=115-114
│   ├── wizard/
│   │   ├── ProfileStep1.jsx   # node-id=66-145
│   │   ├── ProfileStep2.jsx   # node-id=108-2
│   │   └── ProfileStep3.jsx   # node-id=111-20
│   ├── dashboard/
│   │   ├── WorkspaceOverview.jsx  # node-id=73-177
│   │   ├── TeamManagement.jsx     # node-id=73-295
│   │   └── Analytics.jsx          # node-id=140-7
│   └── ui/
│       ├── ProfileCard.jsx    # node-id=117-231
│       └── WorkspaceCard.jsx  # node-id=117-359
```

---

**Ready to transform your Figma designs into React components! 🎨→⚛️**
