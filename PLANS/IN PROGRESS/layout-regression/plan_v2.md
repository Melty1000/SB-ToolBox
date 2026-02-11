# Plan: Fix Layout Sync & Content Shift

## 1. Modify `CitadelShell.tsx`

### A. Remove CSS Transition from Header Text
The `transition-all` class conflicts with the GSAP-driven CSS variable. Removing it ensures 1:1 synchronization.

```tsx
// Current
className="flex items-center transition-all duration-300 ease-out"

// New
className="flex items-center" 
// Style remains: marginLeft: calc(...)
```

### B. Shift Page Content
Apply the same dynamic margin logic to the `<main>` area so the Page Header and Content Viewport move with the sidebar.

```tsx
// Current
<main className="col-start-2 ...">

// New
<main 
    className="col-start-2 ..."
    style={{ marginLeft: 'calc(var(--sidebar-width, 64px) - 64px)' }}
>
```

## 2. Verify
- [ ] Header text moves exactly with sidebar edge.
- [ ] Main content area pushes right as sidebar expands.
- [ ] No "jelly" effect or lag.
