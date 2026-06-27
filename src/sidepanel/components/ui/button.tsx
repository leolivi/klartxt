import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/utils/cn.js"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-body whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-surface-secondary text-ink-strong hover:bg-surface-tertiary",
        secondaryGreen:
          "bg-surface-green text-ink-green hover:bg-surface-green/80",
        secondaryOrange:
          "bg-surface-orange text-ink-orange hover:bg-surface-orange/80",
        secondaryRed:
          "bg-surface-red text-ink-red hover:bg-surface-red/80",
        link: "text-ink-default underline hover:bg-transparent hover:text-ink-strong",
      },
      interactive: {
        true: "cursor-pointer hover:bg-surface-tertiary",
        false: "cursor-default pointer-events-none ",
      },
      size: {
        default: "px-4 py-0 text-body has-[>svg]:p-1 has-[>svg]:aspect-square",
        xs: "h-6 gap-1 rounded-full px-2 text-small",
        sm: "h-8 gap-1.5 rounded-full px-4 text-body has-[>svg]:px-2.5",
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
  leadingIcon,
  trailingIcon,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    interactive?: boolean
    leadingIcon?: React.ReactNode
    trailingIcon?: React.ReactNode
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, interactive, className }))}
      {...props}
    >
      {leadingIcon && <span className="shrink-0 flex items-center">{leadingIcon}</span>}
      <Slot.Slottable>{children}</Slot.Slottable>
      {trailingIcon && <span className="shrink-0 flex items-center">{trailingIcon}</span>}
    </Comp>
  )
}

export { Button, buttonVariants }
