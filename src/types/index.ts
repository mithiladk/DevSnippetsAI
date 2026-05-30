export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  screenshotUri?: string;
  aiExplanation?: string;
}
export interface AIExplanation {
  explanation: string;
  summary: string;
  improvements: string[];
}
export type CreateSnippetInput = Omit<
  Snippet,
  "id" | "createdAt" | "updatedAt"
>;

export type UpdateSnippetInput = Partial<Omit<Snippet, "id">> & { id: string };

export interface LocalFile {
  name: string;
  uri: string;
  size: number;
  modificationTime: number;
  isDirectory: boolean;
}

export type ThemeMode = "light" | "dark" | "system";


export type ExportFormat = 'txt' | 'js' | 'json';
