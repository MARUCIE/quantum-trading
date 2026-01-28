/**
 * Asset Class Context
 *
 * Global state management for selected asset class.
 */

'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { AssetClass, ASSET_CLASSES, getAssetClassInfo } from './types';

interface AssetClassContextValue {
  assetClass: AssetClass;
  setAssetClass: (assetClass: AssetClass) => void;
  assetClassInfo: ReturnType<typeof getAssetClassInfo>;
  availableClasses: typeof ASSET_CLASSES;
}

const AssetClassContext = createContext<AssetClassContextValue | null>(null);

const STORAGE_KEY = 'quantum-x-asset-class';

export function AssetClassProvider({ children }: { children: React.ReactNode }) {
  const [assetClass, setAssetClassState] = useState<AssetClass>('crypto');

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ['crypto', 'stocks', 'futures', 'options'].includes(stored)) {
      setAssetClassState(stored as AssetClass);
    }
  }, []);

  const setAssetClass = useCallback((newAssetClass: AssetClass) => {
    setAssetClassState(newAssetClass);
    localStorage.setItem(STORAGE_KEY, newAssetClass);
  }, []);

  const value: AssetClassContextValue = {
    assetClass,
    setAssetClass,
    assetClassInfo: getAssetClassInfo(assetClass),
    availableClasses: ASSET_CLASSES,
  };

  return (
    <AssetClassContext.Provider value={value}>
      {children}
    </AssetClassContext.Provider>
  );
}

export function useAssetClass() {
  const context = useContext(AssetClassContext);
  if (!context) {
    throw new Error('useAssetClass must be used within an AssetClassProvider');
  }
  return context;
}
