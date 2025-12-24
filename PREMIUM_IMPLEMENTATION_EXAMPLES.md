# Premium Theme Implementation Examples

## Quick Reference for Implementing Premium Styling

Copy and paste these patterns into your components for consistent premium aesthetics.

---

## 1. Premium Page Layout

### Basic Premium Page Structure

```tsx
import { motion } from 'framer-motion';
import { PageWrapper } from '@/components/PageWrapper';
import { pageVariants } from '@/lib/animations';

export default function YourPage() {
  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-blue-950/20 to-neutral-900 relative overflow-hidden">
        
        {/* Background glow elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(91, 135, 255, 0.5), transparent)',
            }}
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <motion.div
          className="relative z-10"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Your content here */}
        </motion.div>
      </div>
    </PageWrapper>
  );
}
```

---

## 2. Premium Form Implementation

### Complete Premium Form Example

```tsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassmorphCard, FloatingLabelInput, MagneticButton } from '@/components/PremiumComponents';
import { colors, animationDurations } from '@/lib/designTokens';

export function PremiumForm() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Your submission logic
    await new Promise(r => setTimeout(r, 1500));
    setIsLoading(false);
  };

  return (
    <GlassmorphCard className="p-8 max-w-md mx-auto">
      <motion.h2
        className="text-2xl font-bold bg-gradient-to-r from-primary-50 to-accent-100 bg-clip-text text-transparent mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Premium Form
      </motion.h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Floating Label Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <FloatingLabelInput
            label="Email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e }))}
            type="email"
            placeholder="you@example.com"
          />
        </motion.div>

        {/* Standard Input with Glow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-2"
        >
          <label className="text-sm font-medium text-foreground-secondary">Password</label>
          <motion.input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-neutral-800/50 border border-neutral-600/30 rounded-xl text-foreground-primary placeholder-foreground-tertiary focus:outline-none"
            animate={{
              borderColor: 'rgba(91, 135, 255, 0.3)',
            }}
            whileFocus={{
              boxShadow: `0 0 20px ${colors.glow.blue}`,
              borderColor: colors.primary[500],
            }}
          />
        </motion.div>

        {/* Magnetic Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="pt-4"
        >
          <MagneticButton
            onClick={() => document.querySelector('form')?.dispatchEvent(new Event('submit', { bubbles: true }))}
            className="w-full py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl shadow-glow-blue hover:shadow-hover-lift transition-all"
            intensity={0.3}
          >
            {isLoading ? 'Processing...' : 'Submit'}
          </MagneticButton>
        </motion.div>
      </form>
    </GlassmorphCard>
  );
}
```

---

## 3. Premium Card Component

### Interactive Card with Tilt & Glow

```tsx
import { TiltCard, GlassmorphCard } from '@/components/PremiumComponents';
import { motion } from 'framer-motion';

export function PremiumCard({ title, description, icon: Icon }) {
  return (
    <TiltCard intensity={0.5} scale={1.02} hoverGlow>
      <GlassmorphCard className="p-6" glow>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mb-4"
            whileHover={{ rotate: 20, scale: 1.1 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>

          <h3 className="text-lg font-semibold text-foreground-primary mb-2">
            {title}
          </h3>
          <p className="text-sm text-foreground-tertiary">
            {description}
          </p>
        </motion.div>
      </GlassmorphCard>
    </TiltCard>
  );
}
```

---

## 4. Premium Button Styles

### Button Variants with Premium Effects

```tsx
// Default Premium Button
<motion.button
  className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-xl shadow-glow-blue hover:shadow-hover-lift transition-all"
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Action
</motion.button>

// Secondary Button (Outline with Glow)
<motion.button
  className="px-6 py-3 border border-primary-500/30 text-primary-50 font-semibold rounded-xl hover:bg-primary-500/10 transition-all"
  whileHover={{ 
    boxShadow: '0 0 20px rgba(91, 135, 255, 0.3)',
    borderColor: 'rgba(91, 135, 255, 0.6)',
  }}
  whileTap={{ scale: 0.95 }}
>
  Secondary
</motion.button>

// Magnetic Button (Cursor-Pulling)
<MagneticButton
  className="px-6 py-3 bg-accent-500 text-white font-semibold rounded-xl shadow-glow-purple"
  intensity={0.3}
>
  Magnetic Action
</MagneticButton>

// Ghost Button (Minimal)
<motion.button
  className="px-6 py-3 text-primary-50 font-semibold rounded-xl hover:bg-white/5 transition-all"
  whileHover={{ x: 5 }}
>
  Learn More →
</motion.button>
```

---

## 5. Premium Grid Layout

### Responsive Grid with Staggered Animations

```tsx
import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '@/lib/animations';

export function PremiumGrid({ items }) {
  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
        >
          <PremiumCard {...item} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

---

## 6. Premium Progress Indicator

### Multi-Step Progress with Premium Styling

```tsx
import { AnimatedProgress } from '@/components/PremiumComponents';

export function StepForm({ currentStep, totalSteps }) {
  return (
    <div className="space-y-6">
      <AnimatedProgress 
        currentStep={currentStep}
        totalSteps={totalSteps}
        className="mb-8"
      />
      
      <div className="flex justify-between">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <motion.div
            key={i}
            className="text-center"
            animate={{
              opacity: i < currentStep ? 1 : 0.5,
              scale: i < currentStep ? 1.05 : 1,
            }}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                i < currentStep
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                  : 'bg-neutral-700 text-foreground-tertiary'
              }`}
            >
              {i + 1}
            </div>
            <p className="text-xs mt-2 text-foreground-secondary">Step {i + 1}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Premium Modal/Dialog

### Glassmorphic Modal with Animations

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { GlassmorphCard, MagneticButton } from '@/components/PremiumComponents';

export function PremiumModal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <GlassmorphCard className="max-w-md w-full p-8 relative">
              <h2 className="text-2xl font-bold text-foreground-primary mb-4">
                {title}
              </h2>

              <div className="mb-6">
                {children}
              </div>

              <div className="flex gap-4">
                <motion.button
                  className="flex-1 px-4 py-2 border border-primary-500/30 text-primary-50 rounded-lg hover:bg-primary-500/10"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                >
                  Cancel
                </motion.button>
                <MagneticButton
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-semibold"
                  intensity={0.2}
                >
                  Confirm
                </MagneticButton>
              </div>
            </GlassmorphCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
```

---

## 8. Premium Stat Card

### Animated Statistics Display

```tsx
import { motion } from 'framer-motion';
import { GlassmorphCard } from '@/components/PremiumComponents';

export function StatCard({ label, value, icon: Icon, trend }) {
  const trendIsPositive = trend > 0;

  return (
    <GlassmorphCard className="p-6" glow>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-4">
          <motion.div
            className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Icon className="w-6 h-6 text-primary-400" />
          </motion.div>

          <motion.span
            className={`text-sm font-semibold px-3 py-1 rounded-full ${
              trendIsPositive
                ? 'bg-semantic-success/20 text-semantic-success'
                : 'bg-semantic-error/20 text-semantic-error'
            }`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {trendIsPositive ? '+' : ''}{trend}%
          </motion.span>
        </div>

        <p className="text-sm text-foreground-tertiary mb-1">{label}</p>
        <motion.h3
          className="text-3xl font-bold text-foreground-primary"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {value}
        </motion.h3>
      </motion.div>
    </GlassmorphCard>
  );
}
```

---

## 9. Premium Loading State

### Animated Loading Spinner with Glassmorphism

```tsx
import { motion } from 'framer-motion';
import { GlassmorphCard } from '@/components/PremiumComponents';
import { colors } from '@/lib/designTokens';

export function PremiumLoader({ message = 'Loading...' }) {
  return (
    <GlassmorphCard className="p-8 flex flex-col items-center justify-center min-h-64">
      {/* Animated spinner ring */}
      <motion.div
        className="w-12 h-12 border-2 border-transparent rounded-full"
        style={{
          borderTopColor: colors.primary[500],
          borderRightColor: colors.accent[500],
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        />{' '}

      {/* Pulsing background orb */}
      <motion.div
        className="absolute w-24 h-24 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow.blue}, transparent)`,
        }}
        animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <p className="text-foreground-secondary mt-6 font-medium">{message}</p>
    </GlassmorphCard>
  );
}
```

---

## 10. Premium Success/Error States

### Animated Feedback Messages

```tsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

export function PremiumFeedback({ type = 'success', message, isVisible }) {
  const isSuccess = type === 'success';
  const Icon = isSuccess ? CheckCircle : AlertCircle;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`p-4 rounded-xl border backdrop-blur-xl ${
            isSuccess
              ? 'bg-semantic-success/10 border-semantic-success/30 text-semantic-success'
              : 'bg-semantic-error/10 border-semantic-error/30 text-semantic-error'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5" />
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## 11. Premium Navigation Link

### Animated Navigation Item with Hover Effect

```tsx
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';

export function PremiumNavLink({ to, label, icon: Icon }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isActive
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
              : 'text-foreground-secondary hover:text-foreground-primary hover:bg-white/5'
          }`
        }
      >
        {Icon && <Icon className="w-5 h-5" />}
        <span>{label}</span>
      </NavLink>
    </motion.div>
  );
}
```

---

## 12. Premium Gradient Text

### Animated Gradient Text Effect

```tsx
import { motion } from 'framer-motion';

export function PremiumGradientText({ children, delay = 0 }) {
  return (
    <motion.h1
      className="text-4xl font-bold"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      style={{
        background: 'linear-gradient(135deg, #f0f4ff 0%, #faf0ff 50%, #f0fffe 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}
    >
      {children}
    </motion.h1>
  );
}
```

---

## Usage Guide

### Import and Use in Your Pages:

```tsx
// In your page component
import { PremiumCard, PremiumForm, StatCard } from '@/components/Premium';
import { GlassmorphCard, MagneticButton } from '@/components/PremiumComponents';

export default function YourPage() {
  return (
    <div className="space-y-8">
      <PremiumGradientText>Welcome to Premium UI</PremiumGradientText>
      
      <PremiumGrid items={cardData} />
      
      <PremiumModal isOpen={showModal} onClose={() => setShowModal(false)}>
        {/* Modal content */}
      </PremiumModal>
    </div>
  );
}
```

---

## Performance Tips

1. **Use `whileInView`** instead of `animate` for cards that are out of viewport
2. **Wrap lists in `containerVariants`** for smooth staggered animations
3. **Reduce `stiffness`** in spring config for smoother animations on slower devices
4. **Use `willChange` CSS** for animated elements
5. **Debounce mouse events** in TiltCard for better performance

---

## Color & Styling Reference

```tsx
// Primary actions
className="bg-gradient-to-r from-primary-500 to-accent-500"

// Secondary actions
className="border border-primary-500/30 text-primary-50"

// Hover glow
className="hover:shadow-glow-blue"

// Glass effect
className="bg-white/5 backdrop-blur-xl border border-white/10"

// Gradient text
style={{ background: 'linear-gradient(...)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}

// Dark background with gradient
className="bg-gradient-to-br from-neutral-900 via-blue-950/20 to-neutral-900"
```

---

**Ready to build premium UIs?** Copy any of these patterns into your components and customize to fit your needs!
