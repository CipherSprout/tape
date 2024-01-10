import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import clsx from 'clsx'
import type { ElementRef } from 'react'
import React, { forwardRef, useId } from 'react'

import { CheckOutline } from './icons'

type Props = CheckboxPrimitive.CheckboxProps & {
  className?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Checkbox = forwardRef<
  ElementRef<typeof CheckboxPrimitive.Root>,
  Props
>(({ size = 'md', className, label, ...props }, ref) => {
  const id = useId()

  const sizeClasses = {
    'size-3': size === 'sm',
    'size-4': size === 'md',
    'size-5': size === 'lg'
  }

  return (
    <form>
      <div className="flex items-center space-x-1.5">
        <CheckboxPrimitive.Root
          className={clsx(
            className,
            'tape-border flex appearance-none items-center justify-center rounded outline-none',
            sizeClasses
          )}
          defaultChecked
          ref={ref}
          id={id}
          {...props}
        >
          <CheckboxPrimitive.Indicator>
            <CheckOutline className={clsx(sizeClasses, 'p-0.5')} />
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <label className="text-sm font-medium leading-none" htmlFor={id}>
          {label}
        </label>
      </div>
    </form>
  )
})

Checkbox.displayName = 'Checkbox'