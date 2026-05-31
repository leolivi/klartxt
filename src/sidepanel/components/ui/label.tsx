import * as React from "react"
import { Label as LabelPrimitive } from "@radix-ui/react-label"
import { cn } from "@/utils/cn.js"

function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive>) {
  return (
    <LabelPrimitive
      data-slot="label"
      className={cn("text-body-bold text-primary select-none bg-primary-50 dark:text-primary-100 dark:bg-primary-950 p-1 rounded-md", className)}
      {...props}
    />
  )
}

export { Label }
