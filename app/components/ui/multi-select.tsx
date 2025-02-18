'use client';

import * as React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Command, CommandGroup, CommandItem } from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function MultiSelect({
  options,
  placeholder,
  className,
}: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  const handleSelect = (option: Option) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((item) => item !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  const handleRemove = (option: Option) => {
    setSelected(selected.filter((item) => item !== option));
  };

  return (
    <Command className={className}>
      <div className="border rounded-md">
        <div className="flex flex-wrap gap-1 p-2">
          {selected.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRemove(option);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => handleRemove(option)}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => handleSelect(option)}
                  className="cursor-pointer"
                >
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
}
