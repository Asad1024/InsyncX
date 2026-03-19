'use client';

import { createContext, useContext, useMemo } from 'react';
import type { PlatformDisplaySettings } from '@/lib/platform-settings';

const DisplaySettingsContext = createContext<PlatformDisplaySettings | null>(null);

export function DisplaySettingsProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: PlatformDisplaySettings;
}) {
  const memo = useMemo(() => value, [value.currencySymbol, value.freeShippingThreshold, value.shippingCharge, value.taxEnabled, value.taxRatePercent]);
  return (
    <DisplaySettingsContext.Provider value={memo}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings(): PlatformDisplaySettings {
  const ctx = useContext(DisplaySettingsContext);
  return ctx ?? {
    currencySymbol: '$',
    freeShippingThreshold: null,
    shippingCharge: null,
    taxEnabled: false,
    taxRatePercent: null,
  };
}
