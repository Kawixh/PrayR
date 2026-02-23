"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type SwitchProps = Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  defaultChecked?: boolean
  onCheckedChange?: (checked: boolean) => void
}

const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      className,
      defaultChecked = false,
      disabled,
      onCheckedChange,
      onClick,
      ...props
    },
    ref
  ) => {
    const [uncontrolledChecked, setUncontrolledChecked] = React.useState(defaultChecked)
    const isControlled = checked !== undefined
    const isChecked = isControlled ? checked : uncontrolledChecked

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event)

      if (event.defaultPrevented || disabled) {
        return
      }

      const nextChecked = !isChecked

      if (!isControlled) {
        setUncontrolledChecked(nextChecked)
      }

      onCheckedChange?.(nextChecked)
    }

    return (
      <button
        aria-checked={isChecked}
        className={cn(
          "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-input p-0.5 transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
          className
        )}
        data-slot="switch"
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleClick}
        ref={ref}
        role="switch"
        type="button"
        {...props}
      >
        <span
          className={cn(
            "size-5 rounded-full bg-background shadow-xs transition-transform",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
          data-slot="switch-thumb"
        />
      </button>
    )
  }
)

Switch.displayName = "Switch"

export { Switch }
