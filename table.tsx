import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto" data-aime-component-name="div"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="9"  data-insp-path="src/components/ui/table.tsx:9:3:div" >
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
     data-aime-component-name="table"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="5"  data-aime-line="10"  data-insp-path="src/components/ui/table.tsx:10:5:table" />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}  data-aime-component-name="thead"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="23"  data-insp-path="src/components/ui/table.tsx:23:3:thead" />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
   data-aime-component-name="tbody"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="31"  data-insp-path="src/components/ui/table.tsx:31:3:tbody" />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-zinc-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-zinc-800/50",
      className
    )}
    {...props}
   data-aime-component-name="tfoot"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="43"  data-insp-path="src/components/ui/table.tsx:43:3:tfoot" />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-zinc-100/50 data-[state=selected]:bg-zinc-100 dark:hover:bg-zinc-800/50 dark:data-[state=selected]:bg-zinc-800",
      className
    )}
    {...props}
   data-aime-component-name="tr"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="58"  data-insp-path="src/components/ui/table.tsx:58:3:tr" />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-zinc-500 [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] dark:text-zinc-400",
      className
    )}
    {...props}
   data-aime-component-name="th"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="73"  data-insp-path="src/components/ui/table.tsx:73:3:th" />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
   data-aime-component-name="td"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="88"  data-insp-path="src/components/ui/table.tsx:88:3:td" />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-zinc-500 dark:text-zinc-400", className)}
    {...props}
   data-aime-component-name="caption"  data-aime-path-name="src/components/ui/table.tsx"  data-aime-column="3"  data-aime-line="103"  data-insp-path="src/components/ui/table.tsx:103:3:caption" />
))
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
