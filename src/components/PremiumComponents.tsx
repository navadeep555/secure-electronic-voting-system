import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRef, useState, ReactNode } from 'react';
import { colors, animationDurations } from '@/lib/designTokens';

/**
 * 3D Tilt Card with Mouse Tracking
 * Follows cursor and tilts in 3D space
 */
interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
  scale?: number;
  hoverGlow?: boolean;
}

export function TiltCard({
  children,
  className = '',
  intensity = 0.5,
  scale = 1.02,
  hoverGlow = true,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Calculate rotation angles based on mouse position
  const rotateX = useTransform(mouseY, [-100, 100], [intensity * 10, -intensity * 10]);
  const rotateY = useTransform(mouseX, [-100, 100], [-intensity * 10, intensity * 10]);

  // Spring animation for smooth following
  const springConfig = { damping: 20, stiffness: 150 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setIsHovering(false);
  };

  return (
    <motion.div
      ref={ref}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovering(true)}
      animate={{
        scale: isHovering ? scale : 1,
      }}
      transition={{ duration: animationDurations.base }}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Glow effect on hover */}
      {hoverGlow && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{
            boxShadow: isHovering
              ? `0 0 40px ${colors.glow.blue}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
              : 'none',
          }}
          transition={{ duration: animationDurations.slow }}
        />
      )}

      {children}
    </motion.div>
  );
}

/**
 * Magnetic Button - Cursor pulls the button toward mouse
 */
interface MagneticButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  intensity?: number;
}

export function MagneticButton({
  children,
  onClick,
  className = '',
  intensity = 0.3,
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const distX = e.clientX - rect.left - centerX;
    const distY = e.clientY - rect.top - centerY;

    const distance = Math.sqrt(distX * distX + distY * distY);
    const radius = 100;

    if (distance < radius) {
      x.set(distX * intensity);
      y.set(distY * intensity);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.button
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        x: xSpring,
        y: ySpring,
      }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
}

/**
 * Hover Glow Effect - Background responds to cursor
 */
interface HoverGlowProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function HoverGlow({
  children,
  className = '',
  glowColor = colors.glow.blue,
}: HoverGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={ref}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Glow orb that follows cursor */}
      <motion.div
        className="absolute pointer-events-none rounded-full"
        style={{
          width: '200px',
          height: '200px',
          left: position.x - 100,
          top: position.y - 100,
          background: glowColor,
          filter: 'blur(40px)',
        }}
        animate={{
          opacity: isHovering ? 0.3 : 0,
        }}
        transition={{ duration: animationDurations.slow }}
      />

      {children}
    </div>
  );
}

/**
 * Floating Label Input - Label animates up on focus
 */
interface FloatingLabelInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

export function FloatingLabelInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  className = '',
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || value.length > 0;

  return (
    <div className={`relative ${className}`}>
      <motion.label
        initial={false}
        animate={{
          y: isFloating ? -24 : 0,
          scale: isFloating ? 0.85 : 1,
          opacity: isFloating ? 0.7 : 1,
        }}
        transition={{ duration: animationDurations.fast }}
        className="absolute left-4 top-4 text-foreground-tertiary"
      >
        {label}
      </motion.label>

      <motion.input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        animate={{
          boxShadow: isFocused
            ? `0 0 20px ${colors.glow.blue}, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
            : 'none',
        }}
        transition={{ duration: animationDurations.fast }}
        className="w-full px-4 py-3 pt-6 bg-neutral-900 border border-neutral-700 rounded-lg text-foreground placeholder-foreground-tertiary"
      />
    </div>
  );
}

/**
 * Animated Progress Steps - Steps animate with momentum
 */
interface AnimatedProgressProps {
  currentStep: number;
  totalSteps: number;
  className?: string;
}

export function AnimatedProgress({
  currentStep,
  totalSteps,
  className = '',
}: AnimatedProgressProps) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <motion.div
          key={index}
          className="h-1 flex-1 bg-neutral-700 rounded-full overflow-hidden"
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{
            scale: index < currentStep ? 1 : 0.8,
            opacity: index < currentStep ? 1 : 0.5,
          }}
          transition={{
            duration: animationDurations.slow,
            type: 'spring',
            stiffness: 200,
            damping: 20,
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: index < currentStep ? 1 : 0 }}
            transition={{
              duration: animationDurations.slow,
              delay: index * 0.1,
            }}
            style={{ originX: 0 }}
          />
        </motion.div>
      ))}
    </div>
  );
}

/**
 * Glassmorphism Card with premium styling
 */
interface GlassmorphCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glow?: boolean;
}

export function GlassmorphCard({
  children,
  className = '',
  hoverEffect = true,
  glow = true,
}: GlassmorphCardProps) {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <motion.div
      className={`relative rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      animate={{
        borderColor: isHovering && hoverEffect ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
        boxShadow: isHovering && hoverEffect
          ? `0 8px 32px rgba(91, 135, 255, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
          : '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      transition={{ duration: animationDurations.slow }}
    >
      {/* Gradient background on hover */}
      {glow && (
        <motion.div
          className="absolute inset-0 opacity-0 pointer-events-none"
          animate={{
            opacity: isHovering ? 0.1 : 0,
          }}
          style={{
            background: `linear-gradient(135deg, ${colors.glow.blue} 0%, transparent 100%)`,
          }}
        />
      )}

      {children}
    </motion.div>
  );
}

export default {
  TiltCard,
  MagneticButton,
  HoverGlow,
  FloatingLabelInput,
  AnimatedProgress,
  GlassmorphCard,
};
