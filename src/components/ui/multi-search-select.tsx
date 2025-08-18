'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';

interface Option {
  id: number;
  name: string;
}

interface MultiSearchSelectProps {
  options: Option[];
  value: number[];
  onValueChange: (value: number[]) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  maxDisplay?: number;
}

export function MultiSearchSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = 'Search...',
  disabled = false,
  className,
  maxDisplay = 2
}: MultiSearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOptions = options.filter((option) => value.includes(option.id));
  const displayText =
    selectedOptions.length === 0
      ? placeholder
      : selectedOptions.length <= maxDisplay
        ? selectedOptions.map((opt) => opt.name).join(', ')
        : `${selectedOptions.length} selected`;

  const handleSelect = (optionId: number) => {
    const newValue = value.includes(optionId)
      ? value.filter((id) => id !== optionId)
      : [...value, optionId];
    onValueChange(newValue);
  };

  const removeOption = (optionId: number) => {
    onValueChange(value.filter((id) => id !== optionId));
  };

  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <div className='space-y-2'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={cn(
              'h-9 w-full justify-between',
              selectedOptions.length === 0 && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <span className='truncate'>{displayText}</span>
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <div className='p-2'>
            <div className='flex items-center border-b px-3 pb-2'>
              <Search className='mr-2 h-4 w-4 shrink-0 opacity-50' />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className='border-0 px-0 focus:ring-0'
              />
            </div>
            <div className='mt-2 max-h-[300px] overflow-y-auto'>
              {filteredOptions.length === 0 ? (
                <div className='text-muted-foreground py-6 text-center text-sm'>
                  No results found.
                </div>
              ) : (
                <div className='space-y-1'>
                  {filteredOptions.map((option) => (
                    <button
                      key={option.id}
                      className={cn(
                        'hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors',
                        value.includes(option.id) &&
                          'bg-accent text-accent-foreground'
                      )}
                      onClick={() => {
                        handleSelect(option.id);
                        setSearchValue('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value.includes(option.id)
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {option.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected items badges */}
      {selectedOptions.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {selectedOptions.map((option) => (
            <Badge
              key={option.id}
              variant='secondary'
              className='flex items-center gap-1 text-xs'
            >
              {option.name}
              <Button
                variant='ghost'
                size='sm'
                className='ml-1 h-auto p-0'
                onClick={() => removeOption(option.id)}
              >
                <X className='h-3 w-3' />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
