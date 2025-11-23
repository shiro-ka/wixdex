import { useState, useCallback } from 'react';

interface CurrentDeckState {
  id: string | null;
  name: string;
  memo: string;
  isSaved: boolean;
}

export function useCurrentDeck() {
  const [state, setState] = useState<CurrentDeckState>({
    id: null,
    name: '',
    memo: '',
    isSaved: true,
  });

  const loadDeck = useCallback((id: string, name: string, memo: string) => {
    setState({
      id,
      name,
      memo,
      isSaved: true,
    });
  }, []);

  const updateMetadata = useCallback((name: string, memo: string) => {
    setState(prev => ({
      ...prev,
      name,
      memo,
      isSaved: true,
    }));
  }, []);

  const createNewDeck = useCallback((id: string, name: string, memo: string) => {
    setState({
      id,
      name,
      memo,
      isSaved: true,
    });
  }, []);

  const markAsUnsaved = useCallback(() => {
    setState(prev => ({ ...prev, isSaved: false }));
  }, []);

  const markAsSaved = useCallback(() => {
    setState(prev => ({ ...prev, isSaved: true }));
  }, []);

  const resetDeck = useCallback(() => {
    setState({
      id: null,
      name: '',
      memo: '',
      isSaved: true,
    });
  }, []);

  return {
    ...state,
    loadDeck,
    updateMetadata,
    createNewDeck,
    markAsUnsaved,
    markAsSaved,
    resetDeck,
  };
}
