import * as React from "react"
import { DayPicker, type DropdownProps } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function CalendarDropdown({
  options,
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) {
  const handleChange = (next: string) => {
    if (!onChange) return
    // react-day-picker expects a ChangeEvent<HTMLSelectElement>; synthesize the
    // minimal shape it actually reads (target.value).
    const event = {
      target: { value: next },
      currentTarget: { value: next },
    } as unknown as React.ChangeEvent<HTMLSelectElement>
    onChange(event)
  }

  return (
    <Select
      value={value !== undefined ? String(value) : undefined}
      onValueChange={handleChange}
      disabled={disabled}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className="h-7 gap-1 border-slate-200 px-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-60 border border-slate-200">
        {options?.map((opt) => (
          <SelectItem
            key={opt.value}
            value={String(opt.value)}
            disabled={opt.disabled}
          >
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 text-sm", className)}
      classNames={{
        dropdowns: "flex items-center gap-2",
        // The textual caption is redundant when the dropdowns render — hide it but keep it for screen readers.
        caption_label: "sr-only",
        selected: "text-sm",
        ...classNames,
      }}
      components={{
        Dropdown: CalendarDropdown,
      }}
      {...props}
    />
  )
}
