import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const progressVariants = cva(
  "relative w-full overflow-hidden rounded-full bg-secondary/20",
  {
    variants: {
      size: {
        sm: "h-2",
        default: "h-3",
        lg: "h-4",
      },
      variant: {
        default: "",
        subtle: "bg-secondary/10",
        prominent: "bg-secondary/30 shadow-sm",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
)

const getProgressColor = (value: number): string => {
  if (value === 0) return "bg-muted"
  if (value <= 30) return "bg-destructive"
  if (value <= 70) return "bg-warning"
  return "bg-success"
}

const getProgressGlow = (value: number): string => {
  if (value === 0) return ""
  if (value <= 30) return "shadow-[0_0_8px_hsl(var(--destructive)/0.3)]"
  if (value <= 70) return "shadow-[0_0_8px_hsl(var(--warning)/0.3)]"
  return "shadow-[0_0_8px_hsl(var(--success)/0.3)]"
}

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  showGlow?: boolean
  showLabel?: boolean
  animated?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, size, variant, showGlow = false, showLabel = false, animated = true, ...props }, ref) => {
  const progressColor = getProgressColor(value)
  const progressGlow = showGlow ? getProgressGlow(value) : ""
  
  return (
    <div className="relative w-full">
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            "h-full w-full flex-1",
            progressColor,
            progressGlow,
            animated && "transition-all duration-500 ease-out"
          )}
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </ProgressPrimitive.Root>
      {showLabel && (
        <div className="mt-1 flex justify-between text-xs text-muted-foreground">
          <span>{value}% completat</span>
          {value === 100 && (
            <span className="text-success font-medium">✓ Finalitzat</span>
          )}
        </div>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress, progressVariants }
