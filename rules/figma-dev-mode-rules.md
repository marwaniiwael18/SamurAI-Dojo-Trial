---
description: SamurAI Dojo Figma Dev Mode MCP Rules
globs: ["**/*.jsx", "**/*.tsx", "**/*.js", "**/*.ts"]
alwaysApply: true
---

# SamurAI Dojo Design System Rules

## Framework & Architecture
- Use React 18 with functional components and modern hooks
- Use Vite for development and building
- Implement components in the `frontend/src/components/` directory
- Follow the existing project structure and naming conventions

## Styling & Design System
- ALWAYS use Tailwind CSS for styling - no custom CSS files
- Follow the SamurAI Dojo color palette:
  - Primary: Blue gradient (#3B82F6 to #1E40AF)
  - Secondary: Purple accent (#8B5CF6)
  - Success: Green (#10B981)
  - Warning: Amber (#F59E0B)
  - Error: Red (#EF4444)
  - Gray scale: slate-50 to slate-900
- Use Inter font family for all typography
- Implement responsive design with mobile-first approach
- Use consistent spacing: 4, 8, 12, 16, 24, 32, 48, 64px (Tailwind's spacing scale)

## Component Guidelines
- Create reusable components in `frontend/src/components/ui/`
- Use proper TypeScript interfaces for component props
- Implement proper accessibility (ARIA labels, keyboard navigation)
- Follow atomic design principles (atoms, molecules, organisms)

## Corporate Authentication Theme
- Use professional, clean design language
- Implement security-focused visual cues (shields, locks, checkmarks)
- Corporate blue color scheme with subtle gradients
- Rounded corners (rounded-lg, rounded-xl) for modern feel
- Box shadows for depth and elevation

## AI/Profiling Components
- Use tech-forward design elements
- Implement progress indicators for wizard flows
- Use animated transitions for state changes
- Include confidence scoring visual indicators
- Smart suggestions with hover states and interactions

## Layout Patterns
- Use CSS Grid and Flexbox through Tailwind utilities
- Implement responsive navigation (mobile hamburger, desktop sidebar)
- Card-based layouts for content organization
- Consistent header heights and spacing
- Proper form layouts with validation states

## Interactive Elements
- Buttons: Use consistent padding, hover states, and focus rings
- Forms: Proper validation states (error, success, loading)
- Modals: Backdrop blur and proper z-index management
- Tooltips: Subtle animations and proper positioning

## Asset Management
- IMPORTANT: If the Figma Dev Mode MCP Server returns a localhost source for an image or SVG, use that source directly
- DO NOT import/add new icon packages - use assets from Figma payload
- DO NOT create placeholders if a localhost source is provided
- Optimize images for web (WebP format when possible)

## State Management Integration
- Connect components to Zustand stores when needed
- Use the existing auth, user, workspace, and AI stores
- Implement proper loading and error states
- Follow the existing API integration patterns

## File Organization
- Components: `frontend/src/components/[category]/ComponentName.jsx`
- Pages: `frontend/src/pages/PageName.jsx`
- Utils: `frontend/src/utils/helperName.js`
- Services: `frontend/src/services/serviceName.js`

## Naming Conventions
- Components: PascalCase (e.g., `AuthForm`, `ProfileWizard`)
- Files: PascalCase for components, camelCase for utilities
- CSS classes: Use Tailwind utilities, avoid custom classes
- Props: camelCase with descriptive names

## Accessibility Requirements
- All interactive elements must be keyboard accessible
- Proper ARIA labels and roles
- Color contrast ratios meeting WCAG 2.1 AA standards
- Focus indicators for all interactive elements
- Screen reader friendly content structure

## Performance Considerations
- Use React.memo for expensive components
- Implement proper image lazy loading
- Code splitting for large components
- Optimize bundle size with proper imports

## Integration with Backend
- Use the existing API endpoints in `backend/routes/`
- Follow the authentication patterns with JWT tokens
- Implement proper error handling for API calls
- Use React Query for data fetching and caching

## Example Component Structure
```jsx
import React from 'react';
import { useAuthStore } from '../store/authStore';

const ComponentName = ({ prop1, prop2, ...props }) => {
  // Component logic here
  
  return (
    <div className="tailwind-classes-here" {...props}>
      {/* Component JSX */}
    </div>
  );
};

export default ComponentName;
```

## Testing Considerations
- Write components that are easily testable
- Use semantic HTML elements
- Implement proper data-testid attributes when needed
- Follow the existing testing patterns in the project
