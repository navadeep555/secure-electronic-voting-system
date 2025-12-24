import { Shield, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface SecurityBadgeProps {
  type: "encrypted" | "verified" | "anonymous" | "secure" | "privacy";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const badgeConfig = {
  encrypted: {
    icon: Lock,
    label: "Encrypted",
    description: "256-bit AES Encryption",
  },
  verified: {
    icon: CheckCircle,
    label: "Verified",
    description: "Identity Verified",
  },
  anonymous: {
    icon: EyeOff,
    label: "Anonymous",
    description: "Vote Privacy Protected",
  },
  secure: {
    icon: Shield,
    label: "Secure",
    description: "End-to-End Security",
  },
  privacy: {
    icon: Eye,
    label: "Privacy",
    description: "Privacy Protected",
  },
};

const sizeClasses = {
  sm: "px-2 py-1 text-xs gap-1",
  md: "px-3 py-1.5 text-sm gap-1.5",
  lg: "px-4 py-2 text-base gap-2",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function SecurityBadge({ type, size = "md", className }: SecurityBadgeProps) {
  const config = badgeConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-success/10 text-success font-medium",
        sizeClasses[size],
        className
      )}
      title={config.description}
    >
      <Icon className={iconSizes[size]} />
      <span>{config.label}</span>
    </div>
  );
}
