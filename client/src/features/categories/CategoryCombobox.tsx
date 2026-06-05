import * as React from 'react'
import { Check, ChevronsUpDown, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

import { useCategories } from './useCategories'

type CategoryComboboxProps = {
  /** Current category NAME (string). The form stores the name; backend resolves to ID. */
  value?: string
  onChange?: (name: string) => void
  placeholder?: string
  id?: string
  className?: string
  disabled?: boolean
}

export function CategoryCombobox({
  value,
  onChange,
  placeholder = 'Pick or create a category',
  id,
  className,
  disabled,
}: CategoryComboboxProps) {
  const { data: categories = [] } = useCategories()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  // Look up the currently-selected category for display (by case-insensitive name match)
  const selected = React.useMemo(
    () => categories.find((c) => c.name.toLowerCase() === value?.toLowerCase()),
    [categories, value],
  )

  const trimmedSearch = search.trim()
  const hasExactMatch =
    trimmedSearch.length > 0 &&
    categories.some(
      (c) => c.name.toLowerCase() === trimmedSearch.toLowerCase(),
    )
  const showCreate = trimmedSearch.length > 0 && !hasExactMatch

  function handleSelect(name: string) {
    onChange?.(name)
    setSearch('')
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'h-auto w-full justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 shadow-none',
            !value && 'text-slate-400',
            className,
          )}
        >
          <span className="flex items-center gap-2 truncate">
            {selected?.color && (
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: selected.color }}
                aria-hidden
              />
            )}
            <span className="truncate capitalize">{value || placeholder}</span>
          </span>
          <ChevronsUpDown size={14} className="text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0 border-slate-200"
      >
        <Command>
          <CommandInput
            placeholder="Search or type a new name…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>
              {trimmedSearch
                ? `No category matches "${trimmedSearch}".`
                : 'No categories yet.'}
            </CommandEmpty>

            {categories.length > 0 && (
              <CommandGroup heading="Existing">
                {categories.map((c) => (
                  <CommandItem
                    key={c._id}
                    value={c.name}
                    onSelect={(v) => handleSelect(v)}
                    className="flex items-center gap-2"
                  >
                    {c.color ? (
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: c.color }}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-2.5 shrink-0 rounded-full bg-slate-300" />
                    )}
                    <span className="flex-1 capitalize">{c.name}</span>
                    {selected?._id === c._id && (
                      <Check size={14} className="text-blue-600" />
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showCreate && (
              <CommandGroup heading="Create">
                <CommandItem
                  value={`__create__${trimmedSearch}`}
                  onSelect={() => handleSelect(trimmedSearch)}
                  className="flex items-center gap-2 text-blue-700"
                >
                  <Plus size={14} />
                  <span>
                    Create <span className="font-medium">“{trimmedSearch}”</span>
                  </span>
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
