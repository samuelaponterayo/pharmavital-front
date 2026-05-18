"use client"

import { useState } from "react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/utils/cn"

interface DatePickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
  min?: Date
  max?: Date
}

function toDate(value: string): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  return new Date(value + "T00:00:00")
}

function fromDate(date: Date): string {
  return format(date, "yyyy-MM-dd")
}

export function DatePicker({ value, onChange, className, min, max }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const selected = toDate(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-10 rounded-lg",
            !value && "text-muted-foreground",
            "dark:bg-zinc-900 dark:border-zinc-700",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          {value
            ? format(new Date(value + "T00:00:00"), "d 'de' MMMM, yyyy", { locale: es })
            : <span>Seleccionar fecha</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(d) => {
            if (d) {
              onChange(fromDate(d))
              setOpen(false)
            }
          }}
          disabled={[
            ...(min ? [{ before: min }] : []),
            ...(max ? [{ after: max }] : []),
          ]}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
