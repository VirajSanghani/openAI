import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-input bg-background",
        glass: "glass border-white/10 bg-white/5 backdrop-blur-md placeholder-white/40 text-white/90 focus-visible:border-white/20 focus-visible:ring-primary/50",
        outline: "border-2 border-primary/20 bg-transparent focus-visible:border-primary focus-visible:ring-primary/20",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: {
      variant: "default",
      resize: "vertical",
    },
  }
);

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  error?: string;
  label?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    variant,
    resize,
    error,
    label,
    helperText,
    maxLength,
    showCount = false,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [currentLength, setCurrentLength] = React.useState(
      typeof value === 'string' ? value.length : 0
    );

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCurrentLength(e.target.value.length);
      onChange?.(e);
    };

    const textareaElement = (
      <textarea
        className={cn(
          textareaVariants({ variant, resize }),
          error && "border-destructive focus-visible:ring-destructive",
          className
        )}
        ref={ref}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
    );

    if (!label && !error && !helperText && !showCount) {
      return textareaElement;
    }

    return (
      <div className="space-y-1">
        {label && (
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {label}
              {props.required && <span className="text-destructive ml-1">*</span>}
            </label>
            {(showCount || maxLength) && (
              <span className="text-xs text-muted-foreground">
                {currentLength}
                {maxLength && `/${maxLength}`}
              </span>
            )}
          </div>
        )}
        {textareaElement}
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
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };