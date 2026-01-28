import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cardVariants } from "@/lib/animations";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className }: AnimatedCardProps) {
  return (
    <motion.div
      className={className}
      initial="initial"
      animate="animate"
      whileHover="hover"
      variants={cardVariants}
    >
      {children}
    </motion.div>
  );
}
