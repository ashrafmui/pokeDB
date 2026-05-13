"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

interface CollapsibleCtx {
  collapsible: boolean
  isOpen: boolean
  toggle: () => void
}

const CardCollapsibleContext = React.createContext<CollapsibleCtx | null>(null)

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  collapsible?: boolean
  defaultOpen?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, collapsible = true, defaultOpen = true, children, ...props },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(defaultOpen)
    const ctx = React.useMemo<CollapsibleCtx>(
      () => ({
        collapsible,
        isOpen,
        toggle: () => setIsOpen((v) => !v),
      }),
      [collapsible, isOpen]
    )

    const cardClass = cn(
      "bg-card text-card-foreground shadow-lg rounded-lg border",
      className
    )

    if (!collapsible) {
      return (
        <CardCollapsibleContext.Provider value={ctx}>
          <div ref={ref} className={cardClass} {...props}>
            {children}
          </div>
        </CardCollapsibleContext.Provider>
      )
    }

    return (
      <CardCollapsibleContext.Provider value={ctx}>
        <CollapsiblePrimitive.Root open={isOpen} onOpenChange={setIsOpen} asChild>
          <div ref={ref} className={cardClass} {...props}>
            {children}
          </div>
        </CollapsiblePrimitive.Root>
      </CardCollapsibleContext.Provider>
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const ctx = React.useContext(CardCollapsibleContext)

  if (!ctx?.collapsible) {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5 p-6", className)}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-start justify-between gap-3 p-6",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0 flex flex-col space-y-1.5">
        {children}
      </div>
      <CollapsiblePrimitive.Trigger asChild>
        <button
          type="button"
          aria-label={ctx.isOpen ? "Collapse section" : "Expand section"}
          className="shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {ctx.isOpen ? (
            <Minus className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </button>
      </CollapsiblePrimitive.Trigger>
    </div>
  )
})
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const collapsibleContentClass =
  "overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(CardCollapsibleContext)
  if (!ctx?.collapsible) {
    return <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  }
  return (
    <CollapsiblePrimitive.Content className={collapsibleContentClass}>
      <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
    </CollapsiblePrimitive.Content>
  )
})
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const ctx = React.useContext(CardCollapsibleContext)
  if (!ctx?.collapsible) {
    return (
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    )
  }
  return (
    <CollapsiblePrimitive.Content className={collapsibleContentClass}>
      <div
        ref={ref}
        className={cn("flex items-center p-6 pt-0", className)}
        {...props}
      />
    </CollapsiblePrimitive.Content>
  )
})
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
