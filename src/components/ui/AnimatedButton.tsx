import { motion } from "framer-motion";
import { forwardRef } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { buttonVariants } from "@/lib/animations";

const AnimatedButton = forwardRef<
  HTMLButtonElement,
  ButtonProps & { children: React.ReactNode }
>(({ children, ...props }, ref) => (
  <motion.div
    whileHover="hover"
    whileTap="tap"
    variants={buttonVariants}
  >
    <Button ref={ref} {...props}>
      {children}
    </Button>
  </motion.div>
));

AnimatedButton.displayName = "AnimatedButton";

export { AnimatedButton };
