import {
  createSnippet,
  deleteSnippet,
  getAllSnippets,
  getFavoriteSnippets,
  saveAIExplanation,
  searchSnippets,
  toggleFavorite,
  updateSnippet,
} from "@/database/snippetQueries";
import { CreateSnippetInput, Snippet, UpdateSnippetInput } from "@/types";
import { useCallback, useEffect, useState } from "react";

interface UseSnippetsReturn {
  snippets: Snippet[];
  favorites: Snippet[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  addSnippet: (input: CreateSnippetInput) => Snippet;
  editSnippet: (input: UpdateSnippetInput) => Snippet | null;
  removeSnippet: (id: string) => void;
  search: (query: string) => Snippet[];
  markFavorite: (id: string) => void;
  cacheAIExplanation: (id: string, explanation: string) => void;
}

export function useSnippets(): UseSnippetsReturn {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [favorites, setFavorites] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSnippets = useCallback(() => {
    try {
      setLoading(true);
      const all = getAllSnippets();
      const favs = getFavoriteSnippets();
      setSnippets(all);
      setFavorites(favs);
      setError(null);
    } catch (e) {
      setError("Failed to load snippets");
      console.error("[useSnippets] Load error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSnippets();
  }, [loadSnippets]);

  const addSnippet = useCallback(
    (input: CreateSnippetInput): Snippet => {
      const newSnippet = createSnippet(input);
      loadSnippets();
      return newSnippet;
    },
    [loadSnippets],
  );

  const editSnippet = useCallback(
    (input: UpdateSnippetInput): Snippet | null => {
      const updated = updateSnippet(input);
      loadSnippets();
      return updated;
    },
    [loadSnippets],
  );

  const removeSnippet = useCallback(
    (id: string): void => {
      deleteSnippet(id);
      loadSnippets();
    },
    [loadSnippets],
  );

  const search = useCallback(
    (query: string): Snippet[] => {
      if (!query.trim()) return snippets;
      return searchSnippets(query);
    },
    [snippets],
  );

  const markFavorite = useCallback(
    (id: string): void => {
      toggleFavorite(id);
      loadSnippets();
    },
    [loadSnippets],
  );

  const cacheAIExplanation = useCallback(
    (id: string, explanation: string): void => {
      saveAIExplanation(id, explanation);
      loadSnippets();
    },
    [loadSnippets],
  );

  return {
    snippets,
    favorites,
    loading,
    error,
    refresh: loadSnippets,
    addSnippet,
    editSnippet,
    removeSnippet,
    search,
    markFavorite,
    cacheAIExplanation,
  };
}
