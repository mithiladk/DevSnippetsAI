// src/utils/exportUtils.ts

import * as FileSystemBase from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Snippet, ExportFormat } from '@/types';


const FileSystem = FileSystemBase as any;

export async function exportSnippet(
  snippet: Snippet,
  format: ExportFormat
): Promise<void> {
  const content  = buildExportContent(snippet, format);
  const filename = `${sanitizeFilename(snippet.title)}.${format}`;

  const baseDir = FileSystem.documentDirectory;
  if (!baseDir) throw new Error('File system not available on this device.');

  const dirUri  = `${baseDir}exports/`;
  const fileUri = `${dirUri}${filename}`;

  await FileSystem.makeDirectoryAsync(dirUri, { intermediates: true });

  await FileSystem.writeAsStringAsync(fileUri, content, {
    encoding: 'utf8',
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.');
  }

  await Sharing.shareAsync(fileUri, {
    mimeType: getMimeType(format),
    dialogTitle: `Share: ${snippet.title}`,
  });
}

function buildExportContent(snippet: Snippet, format: ExportFormat): string {
  if (format === 'json') {
    return JSON.stringify(
      {
        title:     snippet.title,
        language:  snippet.language,
        tags:      snippet.tags,
        code:      snippet.code,
        createdAt: new Date(snippet.createdAt).toISOString(),
      },
      null,
      2
    );
  }

  return [
    `// Title:    ${snippet.title}`,
    `// Language: ${snippet.language}`,
    `// Tags:     ${snippet.tags.join(', ')}`,
    `// Created:  ${new Date(snippet.createdAt).toISOString()}`,
    '',
    snippet.code,
  ].join('\n');
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
}

function getMimeType(format: ExportFormat): string {
  switch (format) {
    case 'json': return 'application/json';
    case 'js':   return 'application/javascript';
    case 'txt':  return 'text/plain';
    default:     return 'text/plain';
  }
}