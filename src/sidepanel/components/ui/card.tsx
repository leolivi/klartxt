import * as React from "react"
import { ArrowUpRight } from "lucide-react"
import { cn } from "@/utils/cn.js"

type CardProps = React.ComponentProps<"div"> & {
  count?: React.ReactNode
  icon?: React.ReactNode
  label?: string
  href?: string
}

function Card({ className, count, icon, label, href, children, ...props }: CardProps) {
  const hasBlueprint = count != null || icon != null

  return (
    <div
      data-slot="card"
      className={cn("bg-primary-100 dark:bg-primary-950 rounded-[15px]", className)}
      {...props}
    >
      {hasBlueprint ? (
        <div className="flex flex-col items-start p-3 gap-1">
          <div className="text-h2">{icon ?? count}</div>
          {label && href ? (
            <a href={href} className="cursor-pointer flex items-center gap-1 text-body underline text-primary dark:text-primary-100">
              {label} <ArrowUpRight size={12} />
            </a>
          ) : label ? (
            <p className="flex items-center gap-1 text-body underline text-primary dark:text-primary-100">
              {label} <ArrowUpRight size={12} />
            </p>
          ) : null}
        </div>
      ) : children}
    </div>
  )
}

export { Card }
