import { motion } from 'framer-motion';
import { useRef, useState, ReactNode } from 'react';

// ═══════════════════════════════════════════════════════════════
// OFFICIAL COMPONENT LIBRARY REPLACEMENT
// ═══════════════════════════════════════════════════════════════
// Note: We retain original component names (GlassmorphCard, MagneticButton)
// to prevent breaking existing imports, but the IMPLEMENTATION is now
// "Standard/Civic" style (no physics, no neon, solid clean UI).
// ═══════════════════════════════════════════════════════════════

/**
 * Standard Card (Was TiltCard)
 * Now a solid official card with subtle shadow. No 3D tilt.
 */
interface TiltCardProps {
    children: ReactNode;
    className?: string;
    intensity?: number; // Ignored in official theme
    scale?: number;     // Ignored
    hoverGlow?: boolean; // Ignored
}

export function TiltCard({
    children,
    className = '',
}: TiltCardProps) {
    return (
        <div
            className={`relative bg-neutral-50 rounded-md border border-neutral-200 shadow-card hover:shadow-card-hover transition-shadow duration-300 ${className}`}
        >
            {children}
        </div>
    );
}

/**
 * Standard Button (Was MagneticButton)
 * Now a solid rect button. No magnetic physics.
 */
interface MagneticButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    intensity?: number; // Ignored
}

export function MagneticButton({
    children,
    onClick,
    className = '',
}: MagneticButtonProps) {
    // Map old gradient classes to new official colors if present in className
    const cleanClassName = className
        .replace('bg-gradient-to-r', '')
        .replace('from-primary-500', '')
        .replace('to-accent-500', 'bg-primary-700 hover:bg-primary-800') // Solid Burgundy
        .replace('from-blue-500', '')
        .replace('to-blue-600', 'bg-primary-700 hover:bg-primary-800')
        .replace('text-white', '') // Will be re-added
        .replace('rounded-xl', 'rounded-md'); // Sharper corners

    return (
        <button
            className={`px-6 py-3 font-bold uppercase tracking-wider text-sm transition-all duration-200 text-white shadow-sm flex items-center justify-center gap-2 ${cleanClassName} ${!className.includes('bg-') ? 'bg-primary-700 hover:bg-primary-800' : ''}`}
            onClick={onClick}
        >
            {children}
        </button>
    );
}

/**
 * Hover Container (Was HoverGlow)
 * Just a simple container now. No glow orb.
 */
interface HoverGlowProps {
    children: ReactNode;
    className?: string;
    glowColor?: string; // Ignored
}

export function HoverGlow({
    children,
    className = '',
}: HoverGlowProps) {
    return (
        <div className={`relative ${className}`}>
            {children}
        </div>
    );
}

/**
 * Standard Input (Was FloatingLabelInput)
 * Standard top-label input for clarity.
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
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            <label className="text-sm font-bold text-neutral-700 uppercase tracking-wide">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 bg-white border border-neutral-300 text-neutral-900 rounded-sm focus:border-primary-700 focus:ring-1 focus:ring-primary-700 focus:outline-none transition-all shadow-inner placeholder:text-neutral-400"
            />
        </div>
    );
}

/**
 * Standard Progress (Was AnimatedProgress)
 * Clean, standard progress bar.
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
        <div className={`flex gap-3 ${className}`}>
            {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                    key={index}
                    className={`h-2 flex-1 rounded-full border border-neutral-200 overflow-hidden ${index < currentStep ? 'bg-neutral-200' : 'bg-neutral-100'
                        }`}
                >
                    <div
                        className={`h-full transition-all duration-300 ease-out ${index < currentStep ? 'bg-primary-700' : 'w-0'
                            }`}
                    />
                </div>
            ))}
        </div>
    );
}

/**
 * Official Card (Was GlassmorphCard)
 * Solid white card, border, subtle shadow. No blurred glass.
 */
interface GlassmorphCardProps {
    children: ReactNode;
    className?: string;
    hoverEffect?: boolean;
    glow?: boolean; // Ignored
}

export function GlassmorphCard({
    children,
    className = '',
    hoverEffect = true,
}: GlassmorphCardProps) {
    return (
        <div
            className={`relative bg-white rounded-lg border border-neutral-200 shadow-card ${hoverEffect ? 'hover:shadow-card-hover hover:border-neutral-300' : ''
                } transition-all duration-300 ${className}`}
        >
            {/* Top Accent Line for Official Feel */}
            <div className="absolute top-0 left-0 w-full h-[3px] bg-primary-700 rounded-t-lg opacity-80" />

            <div className="p-1">
                {children}
            </div>
        </div>
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
