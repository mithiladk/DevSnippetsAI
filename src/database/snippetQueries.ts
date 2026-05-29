import { randomUUID } from 'expo-crypto';
import db from '@/database/db';
import { Snippet,CreateSnippetInput,UpdateSnippetInput } from '@/types';

type SnippetRow = {
    id: string;
    title: string;
    code: string;
    language: string;
    tags: string;
    isFavorite: number;
    createdAt: number;
    updatedAt: number;
    screenshotUri: string | null;
    aiExplanation: string | null;
}

//converts SQLIte row -> Typescript Snippet object

function rowToSnippet(row:SnippetRow): Snippet {
    return {
            ...row,
            tags:JSON.parse(row.tags || '[]'),
            isFavorite:row.isFavorite === 1,
            screenshotUri:row.screenshotUri ?? undefined,
            aiExplanation:row.aiExplanation ?? undefined
    }
}
export function createSnippet(input: CreateSnippetInput) : Snippet {
    const id = randomUUID();
    const now  = Date.now();

    db.runSync(
    `INSERT INTO snippets 
      (id, title, code, language, tags, isFavorite, createdAt, updatedAt, screenshotUri, aiExplanation)
     VALUES 
      (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.title,
      input.code,
      input.language,
      JSON.stringify(input.tags || []),
      input.isFavorite ? 1 : 0,
      now,
      now,
      input.screenshotUri || null,
      input.aiExplanation || null,
    ]
  );

  const saved = db.getFirstSync<SnippetRow>(
    `SELECT * FROM snippets where id = ?` ,
    [id]
  );
  return rowToSnippet(saved!)
}

export function getAllSnippets():Snippet[] {
    const rows = db.getAllSync<SnippetRow>(
        `SELECT * FROM snippets ORDER BY updatedAt DESC`
    );
    return rows.map(rowToSnippet)
}
export function getSnippetById(id: string): Snippet |  null {
    const row = db.getFirstSync<SnippetRow>(
        `SELECT * FROM snippets WHERE id = ?`
    );
    return row ? rowToSnippet(row) :  null;
}

export function searchSnippets(query: string): Snippet[] {
    const searchTerm = `%${query}%`;
    const rows = db.getAllSync<SnippetRow>(
        `SELECT * FROM snippets
         WHERE title LIKE ?
         OR code LIKE ?
         ORDER BY updatedAt DESC
        `,
        [searchTerm,searchTerm,searchTerm]
    );
    return rows.map(rowToSnippet);
}

export function getFavoriteSnippets(): Snippet[] {
  const rows = db.getAllSync<SnippetRow>(
    `SELECT * FROM snippets 
     WHERE isFavorite = 1 
     ORDER BY updatedAt DESC`
  );
  return rows.map(rowToSnippet);
}
export function updateSnippet(input: UpdateSnippetInput): Snippet | null {
  const existing = getSnippetById(input.id);
  if (!existing) return null;

  const updated = {
    ...existing,
    ...input,
    updatedAt: Date.now(),
  };

  db.runSync(
    `UPDATE snippets SET
      title = ?, code = ?, language = ?, tags = ?,
      isFavorite = ?, updatedAt = ?, 
      screenshotUri = ?, aiExplanation = ?
     WHERE id = ?`,
    [
      updated.title,
      updated.code,
      updated.language,
      JSON.stringify(updated.tags),
      updated.isFavorite ? 1 : 0,
      updated.updatedAt,
      updated.screenshotUri || null,
      updated.aiExplanation || null,
      updated.id,
    ]
  );

  return getSnippetById(input.id);
}
export function toggleFavorite(id: string): boolean {
  const snippet = getSnippetById(id);
  if (!snippet) return false;

  const newValue = snippet.isFavorite ? 0 : 1;

  db.runSync(
    `UPDATE snippets SET isFavorite = ?, updatedAt = ? 
     WHERE id = ?`,
    [newValue, Date.now(), id]
  );

  return newValue === 1;
}
export function saveAIExplanation(id: string, explanation: string): void {
  db.runSync(
    `UPDATE snippets SET aiExplanation = ?, updatedAt = ? 
     WHERE id = ?`,
    [explanation, Date.now(), id]
  );
}
export function deleteSnippet(id: string): void {
  db.runSync(
    `DELETE FROM snippets WHERE id = ?`,
    [id]
  );
}
