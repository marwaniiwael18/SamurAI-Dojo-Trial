# 🎨 SamurAI Dojo Figma Component Mapping

## Design URLs and Components

Based on your Figma design file, here are the components we'll generate:

### Authentication Flow
1. **Landing Page** - `node-id=22-2`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=22-2&m=dev
   - Component: `frontend/src/pages/HomePage.jsx`
   - Description: Main landing page with hero section and CTA

2. **Sign Up Page** - `node-id=63-2`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=63-2&m=dev
   - Component: `frontend/src/pages/SignUpPage.jsx`
   - Description: Corporate registration form with email validation

3. **Sign In Page** - `node-id=66-75`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=66-75&m=dev
   - Component: `frontend/src/pages/SignInPage.jsx`
   - Description: Corporate login form with security features

### Profiling Wizard
4. **Profiling Step 1** - `node-id=66-145`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=66-145&m=dev
   - Component: `frontend/src/components/wizard/ProfileStep1.jsx`
   - Description: Basic information collection

5. **Profiling Step 2** - `node-id=108-2`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=108-2&m=dev
   - Component: `frontend/src/components/wizard/ProfileStep2.jsx`
   - Description: Skills and experience assessment

6. **Profiling Step 3** - `node-id=111-20`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=111-20&m=dev
   - Component: `frontend/src/components/wizard/ProfileStep3.jsx`
   - Description: AI suggestions and preferences

### Dashboard Components
7. **Dashboard Layout** - `node-id=66-198`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=66-198&m=dev
   - Component: `frontend/src/pages/DashboardPage.jsx`
   - Description: Main dashboard with navigation and content areas

8. **Workspace Overview** - `node-id=73-177`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=73-177&m=dev
   - Component: `frontend/src/components/dashboard/WorkspaceOverview.jsx`
   - Description: Workspace management interface

9. **Team Management** - `node-id=73-295`
   - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=73-295&m=dev
   - Component: `frontend/src/components/dashboard/TeamManagement.jsx`
   - Description: Team member management with RBAC

### Navigation & Layout
10. **Navigation Header** - `node-id=1-3`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=1-3&m=dev
    - Component: `frontend/src/components/layout/Header.jsx`
    - Description: Main navigation header

11. **Sidebar Navigation** - `node-id=115-114`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=115-114&m=dev
    - Component: `frontend/src/components/layout/Sidebar.jsx`
    - Description: Dashboard sidebar navigation

### Additional Components
12. **Settings Panel** - `node-id=8-7266`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=8-7266&m=dev
    - Component: `frontend/src/components/settings/SettingsPanel.jsx`
    - Description: User and workspace settings

13. **Profile Card** - `node-id=117-231`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=117-231&m=dev
    - Component: `frontend/src/components/ui/ProfileCard.jsx`
    - Description: User profile display card

14. **Workspace Card** - `node-id=117-359`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=117-359&m=dev
    - Component: `frontend/src/components/ui/WorkspaceCard.jsx`
    - Description: Workspace overview card

15. **AI Suggestions** - `node-id=117-482`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=117-482&m=dev
    - Component: `frontend/src/components/ai/SuggestionsPanel.jsx`
    - Description: AI-powered suggestions interface

16. **Analytics Dashboard** - `node-id=140-7`
    - URL: https://www.figma.com/design/E0aLd4tHBvsU4haKTXctvl/The-SamurAI-DOJO--Copy-?node-id=140-7&m=dev
    - Component: `frontend/src/components/dashboard/Analytics.jsx`
    - Description: Analytics and metrics dashboard

## Generation Instructions

### For each component, use these prompts in VS Code:

1. **Open the Figma URL** in Figma Desktop
2. **Select the specific frame/component**
3. **In VS Code chat**, use prompts like:

```
Generate React code for my Figma selection as a SamurAI Dojo [ComponentType] with:
- Corporate professional styling using our blue gradient theme
- Tailwind CSS styling following our design system
- Integration with our authStore/userStore/workspaceStore as needed
- Proper TypeScript interfaces
- Accessibility features (ARIA labels, keyboard navigation)
- Responsive design for mobile and desktop
- Error handling and loading states
- Follow our component organization in frontend/src/components/
```

### Example for Sign Up Page:
```
Generate React code for my Figma selection as a SamurAI Dojo SignUpPage with:
- Corporate email validation using our backend API
- Professional blue gradient styling
- Integration with authStore for registration
- Form validation and error states
- Security-focused visual elements
- Responsive design
- Save as frontend/src/pages/SignUpPage.jsx
```

## Best Practices

1. **Generate one component at a time** for better quality
2. **Start with core pages** (HomePage, SignUp, SignIn, Dashboard)
3. **Then build UI components** (cards, forms, navigation)
4. **Test each component** before moving to the next
5. **Integrate with existing stores** and API endpoints
6. **Follow our file organization** structure

## Integration Notes

- All components should use the existing Zustand stores
- Follow the API patterns in `backend/routes/`
- Use the authentication middleware patterns
- Implement proper error handling
- Include loading states for async operations
- Follow accessibility best practices
