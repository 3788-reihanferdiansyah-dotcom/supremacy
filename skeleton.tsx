import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-zinc-900/10 dark:bg-zinc-50/10", className)}
      {...props}
     data-aime-component-name="div"  data-aime-path-name="src/components/ui/skeleton.tsx"  data-aime-column="5"  data-aime-line="8"  data-insp-path="src/components/ui/skeleton.tsx:8:5:div" />
  )
}

export { Skeleton }
