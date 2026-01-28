/**
 * Asset Class Selector
 *
 * Dropdown selector for switching between asset classes.
 */

'use client';

import { useAssetClass } from '@/lib/assets';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { Bitcoin, TrendingUp, Calendar, Layers, ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const ASSET_ICONS = {
  crypto: Bitcoin,
  stocks: TrendingUp,
  futures: Calendar,
  options: Layers,
} as const;

export function AssetClassSelector() {
  const { assetClass, setAssetClass, availableClasses } = useAssetClass();
  const t = useTranslations('assetClass');

  const currentClass = availableClasses.find((ac) => ac.id === assetClass);
  const CurrentIcon = ASSET_ICONS[assetClass];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 min-w-[140px]">
          <CurrentIcon className="h-4 w-4" />
          <span>{t(assetClass)}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {availableClasses.map((ac) => {
          const Icon = ASSET_ICONS[ac.id];
          const isSelected = ac.id === assetClass;

          return (
            <DropdownMenuItem
              key={ac.id}
              onClick={() => setAssetClass(ac.id)}
              className={cn(
                'flex items-center gap-3 cursor-pointer',
                isSelected && 'bg-accent'
              )}
            >
              <Icon className="h-4 w-4" />
              <div className="flex-1">
                <div className="font-medium">{t(ac.id)}</div>
                <div className="text-xs text-muted-foreground">
                  {t(`${ac.id}Hours`)}
                </div>
              </div>
              {isSelected && (
                <div className="h-2 w-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
