import { ChevronDownIcon } from "lucide-react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/utils/cn.js";

const AccordionContext = React.createContext<{ cardAccordion: boolean }>({ cardAccordion: false });

function Accordion({
  className,
  cardAccordion = false,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & {
  cardAccordion?: boolean;
}) {
  return (
    <AccordionContext.Provider value={{ cardAccordion }}>
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn(cardAccordion && "bg-surface-secondary rounded-[15px] border-b-0 px-3", className)}
        {...props}
      />
    </AccordionContext.Provider>
  );
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const { cardAccordion } = React.useContext(AccordionContext);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "border-b last:border-b-0",
        cardAccordion && "-mx-3 px-3 data-[state=closed]:hover:bg-surface-tertiary rounded-[10px] transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  label,
  actions,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & { label?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <AccordionPrimitive.Header className="flex items-center gap-2">
      {label}
      {actions}
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "flex flex-1 items-start text-body hover:no-underline cursor-pointer text-ink-strongest justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className,
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="pointer-events-none size-4 shrink-0 translate-y-0.5 text-ink-default-foreground transition-transform duration-200" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({ className, children, ...props }: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
