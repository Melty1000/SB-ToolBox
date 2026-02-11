# Plan: Fix Layout Regression

Restore dynamic behavior to the Citadel Shell's branding and header elements.

## 1. Modify `CitadelShell.tsx`

### A. Fix Branding Overlay (Logo)
Update the container to use dynamic width, allowing the centered logo to "slide out" with expansion.

```tsx
// Current
className="col-start-1 ... w-full ..." // Constrained by fixed 64px col

// New
style={{ width: 'var(--sidebar-width, 64px)' }}
```

### B. Fix Window Title
Add a dynamic left margin to the title wrapper to push it clear of the expanding sidebar.

```tsx
// Current
<div className="flex items-center">

// New
<div 
    className="flex items-center transition-all duration-300 ease-out"
    style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}
>
```

## 2. Verify
- [ ] Confirm Logo behavior on hover.
- [ ] Confirm Title Text behavior on hover.
- [ ] Confirm Window Controls stability.
