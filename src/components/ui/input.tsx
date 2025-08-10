import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        glass: "glass border-white/10 bg-white/5 backdrop-blur-md placeholder-white/40 text-white/90 focus-visible:border-white/20 focus-visible:ring-primary/50",
        outline: "border-2 border-primary/20 bg-transparent focus-visible:border-primary focus-visible:ring-primary/20",
      },
      inputSize: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 text-xs",
        lg: "h-10 px-4 text-base",
        xl: "h-12 px-5 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      inputSize: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    inputSize,
    type,
    leftIcon,
    rightIcon,
    error,
    label,
    helperText,
    ...props 
  }, ref) => {
    const inputElement = (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          leftIcon && "pl-10",
          rightIcon && "pr-10",
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon && !label && !error && !helperText) {
      return inputElement;
    }

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          {inputElement}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };