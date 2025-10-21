'use client';

import * as React from 'react';
import { useTheme } from 'next-themes';
import Sun from './icons/Sun';
import Moon from './icons/Moon';
import Monitor from './icons/Monitor';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Theme = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-20 w-20 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-primary-500" />
          <Moon className="absolute h-20 w-20 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-primary-500" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          className="text-dark500_light500 body-bold hover:text-primary-500 "
          onClick={() => setTheme('light')}
        >
          <Sun className="!w-[13px] !h-[13px] " />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-dark500_light500 body-bold"
          onClick={() => setTheme('dark')}
        >
          <Moon className="w-13 h-13 transition-all" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-dark500_light500 body-bold"
          onClick={() => setTheme('system')}
        >
          <Monitor className="text-dark500_light500 body-bold" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default Theme;
