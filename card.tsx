import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-zinc-200 bg-white text-zinc-950 shadow dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50",
      className
    )}
    {...props}
   data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="9"  data-insp-path="src/components/ui/card.tsx:9:3:div" />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
   data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="24"  data-insp-path="src/components/ui/card.tsx:24:3:div" />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("font-semibold leading-none tracking-tight", className)}
    {...props}
   data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="36"  data-insp-path="src/components/ui/card.tsx:36:3:div" />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-zinc-500 dark:text-zinc-400", className)}
    {...props}
   data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="48"  data-insp-path="src/components/ui/card.tsx:48:3:div" />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props}  data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="60"  data-insp-path="src/components/ui/card.tsx:60:3:div" />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
   data-aime-component-name="div"  data-aime-path-name="src/components/ui/card.tsx"  data-aime-column="3"  data-aime-line="68"  data-insp-path="src/components/ui/card.tsx:68:3:div" />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
