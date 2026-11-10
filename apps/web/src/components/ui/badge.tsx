import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-sb-danger-tint text-sb-danger",
        outline: "border-border text-foreground",
        brand:
          "border-transparent bg-sb-saffron text-[#0A0F24]",
        soft:
          "border-transparent bg-sb-saffron-tint text-sb-saffron-deep",
        success:
          "border-transparent bg-sb-navy text-sb-saffron",
        warning:
          "border-transparent bg-sb-butter text-sb-butter-ink",
        info:
          "border-transparent bg-sb-sky text-sb-sky-ink",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
