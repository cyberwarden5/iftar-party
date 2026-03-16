'use client';

import { useState, useEffect, useCallback } from 'react';
import { LocalStorageManager, type AppData, type Participant, type Product } from './local-storage';

export function useLocalStorage() {
  const [data, setData] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setData(LocalStorageManager.getData());
    setIsLoading(false);

    const handleStorageChange = () => {
      setData(LocalStorageManager.getData());
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const refreshData = useCallback(() => {
    setData(LocalStorageManager.getData());
  }, []);

  const addParticipant = useCallback(
    (participant: Omit<Participant, 'id'>) => {
      const result = LocalStorageManager.addParticipant(participant);
      refreshData();
      return result;
    },
    [refreshData]
  );

  const updateParticipant = useCallback(
    (id: string, updates: Partial<Participant>) => {
      const success = LocalStorageManager.updateParticipant(id, updates);
      if (success) refreshData();
      return success;
    },
    [refreshData]
  );

  const deleteParticipant = useCallback(
    (id: string) => {
      const success = LocalStorageManager.deleteParticipant(id);
      if (success) refreshData();
      return success;
    },
    [refreshData]
  );

  const addProduct = useCallback(
    (product: Omit<Product, 'id'>) => {
      const result = LocalStorageManager.addProduct(product);
      refreshData();
      return result;
    },
    [refreshData]
  );

  const updateProduct = useCallback(
    (id: string, updates: Partial<Product>) => {
      const success = LocalStorageManager.updateProduct(id, updates);
      if (success) refreshData();
      return success;
    },
    [refreshData]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const success = LocalStorageManager.deleteProduct(id);
      if (success) refreshData();
      return success;
    },
    [refreshData]
  );

  const updateSettings = useCallback(
    (settings: Partial<AppData['settings']>) => {
      const success = LocalStorageManager.updateSettings(settings);
      if (success) refreshData();
      return success;
    },
    [refreshData]
  );

  return {
    data,
    isLoading,
    refreshData,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings,
  };
}
