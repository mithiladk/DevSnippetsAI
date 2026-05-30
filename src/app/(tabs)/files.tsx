

import { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from 'expo-router';



interface LocalFile {
  name: string;
  uri: string;
  size: number;
  modificationTime: number;
  isDirectory: boolean;
}



const FS = FileSystem as any;
const BASE_DIR = `${FS.documentDirectory}devsnippets/`;


export default function FilesScreen() {
  const [files, setFiles]       = useState<LocalFile[]>([]);
  const [loading, setLoading]   = useState(true);
  const [currentDir, setCurrentDir] = useState(BASE_DIR);
  const [dirHistory, setDirHistory] = useState<string[]>([]);


  useFocusEffect(
    useCallback(() => {
      loadFiles(currentDir);
    }, [currentDir])
  );

  async function ensureBaseDir() {
    const info = await FS.getInfoAsync(BASE_DIR);
    if (!info.exists) {
      await FS.makeDirectoryAsync(BASE_DIR, { intermediates: true });
    }
  }

  async function loadFiles(dir: string) {
    try {
      setLoading(true);
      await ensureBaseDir();
      const items = await FS.readDirectoryAsync(dir);

      const fileDetails: LocalFile[] = await Promise.all(
        items.map(async (name: string) => {
          const uri  = `${dir}${name}`;
          const info = await FS.getInfoAsync(uri);
          return {
            name,
            uri,
            size:             info.size ?? 0,
            modificationTime: info.modificationTime ?? 0,
            isDirectory:      info.isDirectory ?? false,
          };
        })
      );

      // Folders first, then files
      fileDetails.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(fileDetails);
    } catch (e) {
      console.error('[Files] load error:', e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }



  async function handleImport() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: false,
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file    = result.assets[0];
      const destUri = `${currentDir}${file.name}`;

      await FS.copyAsync({ from: file.uri, to: destUri });
      Alert.alert('✅ Imported', `"${file.name}" saved successfully.`);
      loadFiles(currentDir);
    } catch (e) {
      Alert.alert('Error', 'Could not import file.');
    }
  }

  async function handleCreateFolder() {
    Alert.prompt(
      'New Folder',
      'Enter folder name:',
      async (name) => {
        if (!name?.trim()) return;
        const folderUri = `${currentDir}${name.trim()}/`;
        await FS.makeDirectoryAsync(folderUri, { intermediates: true });
        loadFiles(currentDir);
      },
      'plain-text'
    );
  }

  function handleOpenFolder(file: LocalFile) {
    setDirHistory((prev) => [...prev, currentDir]);
    setCurrentDir(`${file.uri}/`);
  }

  function handleGoBack() {
    if (dirHistory.length === 0) return;
    const prev = dirHistory[dirHistory.length - 1];
    setDirHistory((h) => h.slice(0, -1));
    setCurrentDir(prev);
  }

  async function handleShare(file: LocalFile) {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) {
        Alert.alert('Error', 'Sharing not available.');
        return;
      }
      await Sharing.shareAsync(file.uri, {
        dialogTitle: `Share ${file.name}`,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not share file.');
    }
  }

  async function handleCopy(file: LocalFile) {
    try {
      const newName = `copy_${file.name}`;
      const destUri = `${currentDir}${newName}`;
      await FS.copyAsync({ from: file.uri, to: destUri });
      Alert.alert('✅ Copied', `Saved as "${newName}"`);
      loadFiles(currentDir);
    } catch (e) {
      Alert.alert('Error', 'Could not copy file.');
    }
  }

  async function handleDelete(file: LocalFile) {
    Alert.alert(
      'Delete',
      `Delete "${file.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await FS.deleteAsync(file.uri, { idempotent: true });
            loadFiles(currentDir);
          },
        },
      ]
    );
  }

  function handleLongPress(file: LocalFile) {
    Alert.alert(
      file.name,
      `Size: ${formatSize(file.size)}`,
      [
        { text: 'Share / Export', onPress: () => handleShare(file) },
        { text: 'Copy',           onPress: () => handleCopy(file)  },
        { text: 'Delete',  style: 'destructive', onPress: () => handleDelete(file) },
        { text: 'Cancel',  style: 'cancel' },
      ]
    );
  }



  function formatSize(bytes: number): string {
    if (bytes === 0)        return '0 B';
    if (bytes < 1024)       return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function getFileIcon(file: LocalFile): string {
    if (file.isDirectory) return '📁';
    const ext = file.name.split('.').pop()?.toLowerCase();
    const icons: Record<string, string> = {
      js: '🟨', ts: '🔷', py: '🐍', json: '📦',
      txt: '📄', md: '📝',  go: '🐹', rs: '🦀',
    };
    return icons[ext ?? ''] ?? '📄';
  }

  function getRelativePath(): string {
    return currentDir.replace(BASE_DIR, '') || '/';
  }

  

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Files</Text>
            <Text style={styles.headerSubtitle}>
              {getRelativePath()} · {files.length} items
            </Text>
          </View>
          <View style={styles.headerButtons}>
         
            <TouchableOpacity style={styles.iconBtn} onPress={handleImport}>
              <Text style={styles.iconBtnText}>+ Import</Text>
            </TouchableOpacity>
          </View>
        </View>

    
        {dirHistory.length > 0 && (
          <TouchableOpacity style={styles.backRow} onPress={handleGoBack}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        )}
      </View>

   
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#f97316" />
        </View>
      ) : files.length === 0 ? (
   
        <View style={styles.centered}>
          <Text style={styles.emptyIcon}>📂</Text>
          <Text style={styles.emptyTitle}>No files yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap + Import to add files
          </Text>
          <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
            <Text style={styles.importBtnText}>+ Import File</Text>
          </TouchableOpacity>
        </View>
      ) : (
   
        <FlatList
          data={files}
          keyExtractor={(item) => item.uri}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.fileRow}
              onPress={() => item.isDirectory
                ? handleOpenFolder(item)
                : handleLongPress(item)
              }
              onLongPress={() => handleLongPress(item)}
              activeOpacity={0.7}
            >
           
              <Text style={styles.fileIcon}>{getFileIcon(item)}</Text>

            
              <View style={styles.fileInfo}>
                <Text style={styles.fileName} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.fileMeta}>
                  {item.isDirectory
                    ? 'Folder'
                    : formatSize(item.size)
                  }
                </Text>
              </View>

           
              <View style={styles.fileActions}>
                {!item.isDirectory && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleShare(item)}
                  >
                    <Text style={styles.actionBtnText}>↑</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item)}
                >
                  <Text style={styles.actionBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: '#0A0A0A' },
  centered:   { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },

 
  header: {
    paddingHorizontal: 16, paddingTop: 8,
    paddingBottom: 12, gap: 8,
    borderBottomWidth: 1, borderBottomColor: '#2a2a2a',
  },
  headerTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 12, color: '#555555', marginTop: 2 },
  headerButtons:  { flexDirection: 'row', gap: 8 },
  iconBtn: {
    backgroundColor: '#f97316', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  iconBtnText:  { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  backRow:      { paddingVertical: 4 },
  backText:     { color: '#f97316', fontSize: 14, fontWeight: '600' },

  emptyIcon:     { fontSize: 48, marginBottom: 8 },
  emptyTitle:    { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  emptySubtitle: { fontSize: 14, color: '#555555' },
  importBtn: {
    marginTop: 16, backgroundColor: '#f97316',
    paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8,
  },
  importBtnText: { color: '#FFFFFF', fontWeight: '700' },


  listContent: { paddingBottom: 100 },
  fileRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#1f1f1f',
    gap: 12,
  },
  fileIcon:    { fontSize: 24 },
  fileInfo:    { flex: 1, gap: 2 },
  fileName:    { fontSize: 14, fontWeight: '600', color: '#FFFFFF' },
  fileMeta:    { fontSize: 12, color: '#555555' },
  fileActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 32, height: 32, borderRadius: 6,
    backgroundColor: '#1f1f1f', borderWidth: 1,
    borderColor: '#2a2a2a', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtn:     { borderColor: '#FF6B6B' },
  actionBtnText: { fontSize: 14 },
});