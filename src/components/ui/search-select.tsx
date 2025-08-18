'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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

interface SearchSelectProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder,
  searchPlaceholder = 'Search...',
  disabled = false,
  className
}: SearchSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  const selectedOption = options.find(
    (option) => option.id.toString() === value
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={cn(
            'h-9 w-full justify-between',
            !selectedOption && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          {selectedOption ? selectedOption.name : placeholder}
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
            {options.filter((option) =>
              option.name.toLowerCase().includes(searchValue.toLowerCase())
            ).length === 0 ? (
              <div className='text-muted-foreground py-6 text-center text-sm'>
                No results found.
              </div>
            ) : (
              <div className='space-y-1'>
                {options
                  .filter((option) =>
                    option.name
                      .toLowerCase()
                      .includes(searchValue.toLowerCase())
                  )
                  .map((option) => (
                    <button
                      key={option.id}
                      className={cn(
                        'hover:bg-accent hover:text-accent-foreground flex w-full items-center rounded-sm px-2 py-1.5 text-sm transition-colors',
                        value === option.id.toString() &&
                          'bg-accent text-accent-foreground'
                      )}
                      onClick={() => {
                        onValueChange(option.id.toString());
                        setOpen(false);
                        setSearchValue('');
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          value === option.id.toString()
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
  );
}
