# SecureVote UI Animation System

## Overview

This document outlines all the modern animations implemented across the SecureVote application using Framer Motion. These animations provide a smooth, professional, and engaging user experience while maintaining accessibility standards.

---

## Animation Components

### 1. **PageWrapper** (`src/components/PageWrapper.tsx`)
- **Purpose**: Wraps entire pages with fade + slide transition animations
- **Animation**: Fade in (opacity 0→1) + slight upward slide (y: 20→0)
- **Duration**: 400ms
- **Easing**: easeOut
- **Applied to**: All major pages (Index, Login, Register)

### 2. **AnimatedContainer & AnimatedItem** (`src/components/AnimatedContainer.tsx`)
- **Purpose**: Creates staggered animations for groups of elements
- **Container Animation**: Staggered children with 100ms delay between each
- **Item Animation**: Fade-up effect with 400ms duration
- **Use Case**: Stats sections, feature grids, dashboard cards

### 3. **AnimatedButton** (`src/components/ui/AnimatedButton.tsx`)
- **Hover Effect**: Subtle scale-up (1.02x) over 200ms
- **Tap Effect**: Scale-down (0.98x) for tactile feedback
- **Easing**: easeOut
- **Applied to**: All primary action buttons

### 4. **AnimatedInput** (`src/components/ui/AnimatedInput.tsx`)
- **Focus Effect**: Animated box-shadow expansion
- **Shadow Color**: Primary accent with 0.1 opacity
- **Duration**: 200ms
- **Applied to**: Form inputs across Login and Register pages

### 5. **AnimatedCard** (`src/components/ui/AnimatedCard.tsx`)
- **Initial**: Fade-up from opacity 0, y: 20
- **Hover**: Lifts up 8px with smooth shadow transition
- **Duration**: 300ms
- **Applied to**: Feature cards, dashboard cards

### 6. **AnimatedSpinner** (`src/components/ui/AnimatedSpinner.tsx`)
- **Animation**: Continuous 360° rotation
- **Duration**: 2 seconds per rotation
- **Speed**: Linear easing for consistent motion
- **Used in**: Loading states, verification screens

---

## Page-Specific Animations

### **Header Component** (`src/components/layout/Header.tsx`)
- **Header Bar**: Slides down from y: -100 to 0 (300ms)
- **Logo**: Scale and tap animations on hover/click
- **Navigation Items**: Staggered fade-in with 50ms delays
- **Auth Buttons**: Smooth scale animations with 200ms delay

### **Index/Home Page** (`src/pages/Index.tsx`)
- **Hero Badge**: Scale + fade-in (400ms)
- **Hero Title**: Fade-up animation (500ms, delay: 100ms)
- **Hero Description**: Fade-up with 200ms stagger delay
- **CTA Buttons**: Hover scale + tap animations
- **Security Badges**: Fade-in at 400ms delay
- **Stats Cards**: Staggered fade-up animations
- **Feature Cards**: Hover lift effect + icon scale animations
- **How It Works Steps**: Sequential animations with number hover effects
- **Sections**: Appear on scroll using `whileInView`

### **Login Page** (`src/pages/Login.tsx`)
- **Page Wrapper**: Smooth fade-up transition
- **Header Section**: Delayed fade-in with shield icon animation
- **Login Card**: Hover shadow elevation effect
- **Security Badges**: Staggered horizontal animation
- **Form Inputs**: Individual fade-up animations with stagger
- **Password Toggle Button**: Scale hover/tap effects
- **OTP Step**: Cross-fade transition with `AnimatePresence`
- **Loading States**: Pulsing opacity animation for "Verifying..." text
- **Phone Icon**: Rotating animation during OTP display
- **Form Transitions**: Smooth cross-fade between credential and OTP steps

### **Register Page** (`src/pages/Register.tsx`)
- **Header**: Fade-up and delayed animations
- **Progress Steps**: Staggered animations with scale effects on active step
- **Progress Bar**: Scale animation as user progresses
- **Form Card**: Fade-up with shadow elevation on hover
- **Form Content**: Cross-fade transitions between steps using `AnimatePresence`
- **Step Header**: Sliding text animation
- **Navigation Buttons**: Hover scale effects
- **Submit Button**: Rotating spinner animation during processing

---

## Animation Specifications

### Timing
- **Fast interactions** (buttons, inputs): 150-200ms
- **Medium transitions** (page changes): 300-400ms
- **Slow animations** (loading spinners): 2000ms

### Easing Functions
- `easeOut`: For entrance animations (feels natural and responsive)
- `easeIn`: For exit animations (feels controlled)
- `linear`: For continuous spinners

### Stagger Timing
- **Between items**: 100ms for moderate stagger
- **Delayed starts**: 50-200ms depending on visual hierarchy

---

## Accessibility Features

### Prefers Reduced Motion
The application respects the `prefers-reduced-motion` CSS media query:
- **When enabled**: All animations have 0.01ms duration
- **File**: `src/animations.css`
- **Impact**: Users with vestibular disorders or motion sensitivity get instant UI updates

### Color and Contrast
- All animations use high-contrast shadows
- Animations don't interfere with text readability
- Focus states remain clearly visible

### Keyboard Navigation
- Animations apply equally to keyboard and mouse interactions
- Tab order unaffected by animation states
- Form validation animations don't block input

---

## Best Practices Implemented

✅ **Subtle & Professional**: No flashy or distracting effects
✅ **Fast & Responsive**: 150-400ms for most interactions
✅ **Consistent**: Similar animations across similar components
✅ **Accessible**: Respects motion preferences and maintains WCAG standards
✅ **Performance**: Uses GPU-accelerated properties (transform, opacity)
✅ **Mobile-Friendly**: Adapts to touch interactions with tap feedback
✅ **Context-Aware**: Login/OTP screens use calm, minimal animations

---

## Performance Considerations

- Uses `transform` and `opacity` for animations (GPU-accelerated)
- Avoids animating expensive properties like `width`, `height`, `left`, `right`
- Uses `willChange` implicitly through Framer Motion
- Lazy renders with `AnimatePresence` for tab/step transitions
- Motion respects system preferences to prevent battery drain

---

## Future Enhancements

1. **Gesture-Based Animations**: Swipe transitions for mobile
2. **Scroll-Linked Animations**: Parallax effects as users scroll
3. **Microinteractions**: Detailed feedback on form submissions
4. **Dark Mode Transitions**: Smooth color scheme changes
5. **Advanced Loading States**: Animated progress indicators

---

## Testing Checklist

- [ ] Page transitions smooth on desktop and mobile
- [ ] Button interactions feel responsive
- [ ] Form focus states clearly indicated
- [ ] Loading states show progress
- [ ] `prefers-reduced-motion` disabled all animations
- [ ] No jank or frame drops on animations
- [ ] Accessibility features intact (focus, keyboard nav)
- [ ] Cross-browser compatibility verified
