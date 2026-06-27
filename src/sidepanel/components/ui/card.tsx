import * as React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/utils/cn.js"

type CardProps = React.ComponentProps<"div"> & {
  count?: React.ReactNode
  icon?: React.ReactNode
  label?: string
  href?: string
}

function Card({ className, count, icon, label, href, children, onClick, onKeyDown, ...props }: CardProps) {
  const hasBlueprint = count != null || icon != null
  const isInteractive = !!onClick

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (isInteractive && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
    }
    onKeyDown?.(e);
  }

  return (
    <div
      data-slot="card"
      className={cn("bg-surface-secondary hover:bg-surface-tertiary rounded-[15px]", className)}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      {...props}
    >
      {hasBlueprint ? (
        <div className="flex flex-col items-start p-3 gap-1">
          {label && href ? (
            <a href={href} className="cursor-pointer flex items-center w-full justify-between pb-2 text-body text-ink-default">
              {label} <ArrowRight size={16} />
            </a>
          ) : label ? (
            <p className="flex items-center w-full justify-between pb-2 text-body text-ink-default">
              {label} <ArrowRight size={16} />
            </p>
          ) : null}
          <div className="text-h2 text-ink-strong">{icon ?? count}</div>
        </div>
      ) : children}
    </div>
  )
}

export { Card }
