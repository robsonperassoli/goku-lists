import { useState, useCallback } from 'react';

import * as Crypto from 'expo-crypto';
import { useCreateList } from '@/hooks/lists';

export function useCreateListForm(onSuccess?: () => void) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const createList = useCreateList();

  const handleSubmit = useCallback(() => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setError(null);
    createList.mutate(
      {
        id: Crypto.randomUUID(),
        name: name.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          setName('');
          setDescription('');
          onSuccess?.();
        },
        onError: () => {
          setError('Failed to create list');
        },
      }
    );
  }, [name, description, createList, onSuccess]);

  const reset = useCallback(() => {
    setName('');
    setDescription('');
    setError(null);
  }, []);

  return {
    name,
    setName,
    description,
    setDescription,
    error,
    handleSubmit,
    isLoading: createList.isPending,
    reset,
  };
}