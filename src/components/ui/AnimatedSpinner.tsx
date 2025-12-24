import { motion } from "framer-motion";
import { spinnerVariants } from "@/lib/animations";

export function AnimatedSpinner() {
  return (
    <motion.div
      className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full"
      animate="animate"
      variants={spinnerVariants}
    />
  );
}
