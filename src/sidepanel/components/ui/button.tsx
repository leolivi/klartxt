import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/utils/cn.js"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-btn-bg text-primary dark:text-primary-950 hover:bg-btn-bg-hover",
        defaultFocus:
          "border border-btn-border bg-btn-bg text-primary dark:text-primary-950 hover:bg-btn-bg-hover",
        secondaryGreen:
          "bg-risk-low-fill text-risk-low-text dark:text-risk-low-text hover:bg-risk-low-fill/80",
        secondaryGreenOutlined:
          "bg-risk-low-fill text-risk-low-text dark:text-risk-low-text border border-risk-low-border hover:bg-risk-low-fill/80",
        secondaryOrange:
          "bg-risk-medium-fill text-risk-medium-text dark:text-risk-medium-text hover:bg-risk-medium-fill/80",
        secondaryOrangeOutlined:
          "bg-risk-medium-fill text-risk-medium-text dark:text-risk-medium-text border border-risk-medium-border hover:bg-risk-medium-fill/80",
        secondaryRed:
          "bg-risk-high-fill text-risk-high-text dark:text-risk-high-text hover:bg-risk-high-fill/80",
        secondaryRedOutlined:
          "bg-risk-high-fill text-risk-high-text dark:text-risk-high-text border border-risk-high-border hover:bg-risk-high-fill/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline hover:underline",
      },
      interactive: {
        true: "",
        false: "cursor-default pointer-events-none hover:bg-transparent hover:border-transparent",
      },
      size: {
        default: "px-4 py-0 text-body has-[>svg]:p-1 has-[>svg]:aspect-square",
        xs: "h-6 gap-1 rounded-md px-2 text-small has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 text-small has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 text-h3 has-[>svg]:px-4",
        icon: "size-9",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      interactive: true,
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  interactive = true,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    interactive?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, interactive, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
