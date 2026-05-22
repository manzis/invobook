---
description: Advanced rules for Next.js 15 performance, React 19 hydration safety, Tailwind v4 compilation, and native CSS transitions.
---

# Performance Optimization & Production Stability Guide

This guide ensures that all user interfaces and frontend code in Invobook achieve optimal loading speed, render instantly without blocking the main thread, prevent hydration flickering, and maintain high performance scores in both development and production.

---

## ⚡ Crucial Core Principles

1.  **Zero Hydration Render-Blocks**: Never block initial page rendering using full-screen overlays that rely on raw state toggling or setting `body { opacity: 0 }`. These mechanisms conflict with Next.js static generation and hydration, leading to white screens.
2.  **CSS-First Animations**: Prioritize hardware-accelerated CSS transitions and transforms over CPU-intensive JavaScript libraries (like `framer-motion`) for simple micro-interactions, navigations, and hover states.
3.  **Critical Path First**: Prioritize getting the Largest Contentful Paint (LCP) under 1.5s by using lightweight typography, optimized SVGs, deferred loading of heavy scripts, and preconnecting to resources.

---

## 🌐 Next.js 15 & React 19 Hydration Safety

To avoid React 19 compilation and hydration mismatches (where the server-rendered HTML does not match the client-rendered output), strictly enforce hydration safety patterns:

### 1. The Hydration Safe Wrapper
For components relying on browser-only resources (such as `window`, `localStorage`, `document`, or dynamic relative times), wrap state updates cleanly:
```javascript
import { useEffect, useState } from 'react';

export default function SafeComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <SkeletonLoader />; // Render static skeleton first, preventing mismatch
  }

  return <RealComponent />;
}
```

### 2. Eliminating Oppresive Initial OPACITY Classes
Never try to hide page loads with global CSS hiding.
*   **❌ AVOID**: Adding an `.initial-loading` style setting `body { opacity: 0 }` and waiting for a script to remove it.
*   **✅ PREFER**: Let the server render semantic layouts immediately. Use modern skeletons (`animate-pulse`) for components that require data fetching.

---

## 🚀 Native CSS & Hardware-Accelerated Animations

Avoid importing large libraries like `framer-motion` for simple elements. Use native Tailwind v4 transition classes that leverage hardware acceleration (compositor thread):

### 1. Standard Hover / Focus Transitions
Combine `transition-*` properties with `duration` and `will-change` to avoid layout thrashing.
```html
<!-- ✅ CORRECT - Lightweight, smooth hover with CSS transitions -->
<button class="bg-black hover:bg-neutral-800 text-white transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:ring-black">
  Button
</button>
```

### 2. Smooth Slide & Fade Micro-Interactions (Menus/Modals)
Leverage CSS keyframes or transition classes rather than JS-controlled coordinate interpolation.
```css
/* src/styles/globals.css */
@keyframes slideUp {
  from {
    transform: translateY(12px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
```

---

## 🎨 TailwindCSS v4 Styling Optimization

The project uses TailwindCSS v4 (integrated with `@tailwindcss/postcss`). Keep the compile path fast and bundle size compact:

1.  **Predefined CSS Variables over Hex Codes**: Prefer leveraging system variables from `Design/vercel/tokens.css` (e.g., `var(--ds-gray-600)`) instead of inline custom arbitrary values like `text-[#4d4d4d]`.
2.  **Avoid Excessive `@apply` directives**: Excessive nested `@apply` directives in `globals.css` bloat CSS file output. Write simple utility compositions in components.
3.  **Modern Rounding Scale**: Restrict rounding classes to `rounded-md` (8px for buttons/inputs) and `rounded-lg` (12px for cards) for consistency with the design system.

---

## 📈 Loading Performance Checklist

When building/releasing features, ensure these optimization steps are completed:

- [ ] **Image Optimization**: Ensure images are sized correctly, using modern Next.js `next/image` components or optimized SVGs, never referencing raw uncompressed PNG/JPEG files.
- [ ] **Deferred Heavy Libraries**: Load heavy resources (like `@react-pdf/renderer` or document parsers) dynamically via Next.js `dynamic()` imports to keep initial bundle sizes low.
- [ ] **Preconnect Hints**: Ensure cross-origin preconnect links are added to `_document.js` for external resources (like Google Fonts `fonts.googleapis.com` or Vercel analytics).
- [ ] **No Layout Shifts (CLS)**: Set explicit height and width bounds on containers (especially skeleton containers and icons) to prevent elements from shifting when loaded.
