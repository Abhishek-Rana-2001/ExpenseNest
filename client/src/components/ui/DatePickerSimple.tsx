import * as React from "react"
import { format, isValid, parseISO } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DatePickerSimpleProps = {
  /** ISO date string in `yyyy-MM-dd` format. */
  value?: string
  /** Fires with an ISO date string in `yyyy-MM-dd` format (or empty string when cleared). */
  onChange?: (value: string) => void
  placeholder?: string
  /** Disables dates strictly after this date. */
  maxDate?: Date
  /** Disables dates strictly before this date. */
  minDate?: Date
  id?: string
  className?: string
  disabled?: boolean
}

function toDate(value?: string): Date | undefined {
  if (!value) return undefined
  const d = parseISO(value)
  return isValid(d) ? d : undefined
}

export function DatePickerSimple({
  value,
  onChange,
  placeholder = "Pick a date",
  maxDate,
  minDate,
  id,
  className,
  disabled,
}: DatePickerSimpleProps) {
  const [open, setOpen] = React.useState(false)
  const selected = toDate(value)

  const handleSelect = (date: Date | undefined) => {
    onChange?.(date ? format(date, "yyyy-MM-dd") : "")
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-auto w-full justify-start gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-none",
            !selected && "text-slate-400",
            className,
          )}
        >
          <CalendarIcon size={14} className="text-slate-400" />
          {selected ? format(selected, "PP") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={4}
        className="w-auto overflow-hidden border-slate-200 p-0 data-[state=closed]:duration-75 data-[state=open]:duration-100 data-[state=closed]:zoom-out-100 data-[state=open]:zoom-in-100 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1"
      >
        <Calendar
          mode="single"
          selected={selected}
          defaultMonth={selected}
          onSelect={handleSelect}
          disabled={
            maxDate || minDate
              ? (date) =>
                  (maxDate ? date > maxDate : false) ||
                  (minDate ? date < minDate : false)
              : undefined
          }
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
