import { motion } from "framer-motion";
import { forwardRef, useState } from "react";
import { Input, InputProps } from "@/components/ui/input";
import { inputVariants } from "@/lib/animations";

const AnimatedInput = forwardRef<HTMLInputElement, InputProps>(
  ({ ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
      <motion.div
        animate={isFocused ? "focus" : "initial"}
        variants={inputVariants}
      >
        <Input
          ref={ref}
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />
      </motion.div>
    );
  }
);

AnimatedInput.displayName = "AnimatedInput";

export { AnimatedInput };
