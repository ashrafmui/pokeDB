"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"
import { Minus, Plus } from "lucide-react"

import { cn } from "@/lib/utils"

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger

const CollapsibleContent = CollapsiblePrimitive.CollapsibleContent

const AnimatedCollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>
>(({ className, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up",
      className
    )}
    {...props}
  />
))
AnimatedCollapsibleContent.displayName = "AnimatedCollapsibleContent"

interface CollapseToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  isOpen: boolean
  onToggle: () => void
}

const CollapseToggle = React.forwardRef<HTMLButtonElement, CollapseToggleProps>(
  ({ isOpen, onToggle, className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label={isOpen ? "Collapse section" : "Expand section"}
      aria-expanded={isOpen}
      onClick={onToggle}
      className={cn(
        "shrink-0 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
        className
      )}
      {...props}
    >
      {isOpen ? (
        <Minus className="h-4 w-4" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </button>
  )
)
CollapseToggle.displayName = "CollapseToggle"

function useCollapsible(defaultOpen = true) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  const toggle = React.useCallback(() => setIsOpen((v) => !v), [])
  return { isOpen, toggle, setIsOpen }
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  AnimatedCollapsibleContent,
  CollapseToggle,
  useCollapsible,
}
