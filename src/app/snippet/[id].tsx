// src/app/snippet/[id].tsx

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useSnippets } from '@/hooks/useSnippets';
import { AIExplanationCard } from '@/components/AIExplanationCard';
import { LanguageBadge } from '../../components/LanguageBadge';
import { explainCode } from '@/services/aiService';
import { exportSnippet } from '@/utils/exportUtils';
import { AIExplanation, ExportFormat, Snippet } from '@/types';


export default function SnippetDetail() {
  // ── Get the id from the URL ──
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    snippets,
    removeSnippet,
    markFavorite,
    cacheAIExplanation,
  } = useSnippets();


  const snippet = snippets.find((s) => s.id === id) ?? null;


  const [copied, setCopied]         = useState(false);
  const [aiLoading, setAiLoading]   = useState(false);
  const [aiError, setAiError]       = useState<string | null>(null);
  const [aiResult, setAiResult]     = useState<AIExplanation | null>(null);
  const [exporting, setExporting]   = useState(false);

  useEffect(() => {
    if (snippet?.aiExplanation) {
      try {
        setAiResult(JSON.parse(snippet.aiExplanation));
      } catch {
        // cached value was malformed — ignore
      }
    }
  }, [snippet?.id]);


  async function handleCopy() {
    if (!snippet) return;
    await Clipboard.setStringAsync(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleAIExplain() {
    if (!snippet) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await explainCode(snippet.code, snippet.language);
      setAiResult(result);
      cacheAIExplanation(snippet.id, JSON.stringify(result));
    } catch (e: any) {
      setAiError(e.message ?? 'Something went wrong. Please try again.');
    } finally {
      setAiLoading(false);
    }
  }

  async function handleExport(format: ExportFormat) {
    if (!snippet) return;
    try {
      setExporting(true);
      await exportSnippet(snippet, format);
    } catch (e: any) {
      Alert.alert('Export Failed', e.message ?? 'Could not export snippet.');
    } finally {
      setExporting(false);
    }
  }

  function handleEdit() {
    router.push(`/snippet/edit/${id}`);
  }

  function handleToggleFavorite() {
    if (!snippet) return;
    markFavorite(snippet.id);
  }

  function handleDelete() {
    Alert.alert(
      'Delete Snippet',
      `Are you sure you want to delete "${snippet?.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!snippet) return;
            removeSnippet(snippet.id);
            router.back();
          },
        },
      ]
    );
  }

  function handleExportPress() {
    Alert.alert(
      'Export As',
      'Choose a format to export this snippet',
      [
        { text: 'JSON',       onPress: () => handleExport('json') },
        { text: 'JavaScript', onPress: () => handleExport('js')   },
        { text: 'Text',       onPress: () => handleExport('txt')  },
        { text: 'Cancel',     style: 'cancel'                     },
      ]
    );
  }


  if (!snippet) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading snippet...</Text>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>

     
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

   
        <View style={styles.headerActions}>
      
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleToggleFavorite}
          >
            <Text style={styles.favoriteIcon}>
              {snippet.isFavorite ? '★' : '☆'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleEdit}
          >
            <Text style={styles.iconButtonText}>✎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >

    
        <View style={styles.titleSection}>
          <Text style={styles.title}>{snippet.title}</Text>
          <LanguageBadge language={snippet.language} />
        </View>

   
        {snippet.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {snippet.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}
        <Text style={styles.timestamp}>
          Updated {new Date(snippet.updatedAt).toLocaleDateString()}
        </Text>

    
        <View style={styles.codeCard}>
        
          <View style={styles.codeHeader}>
            <Text style={styles.codeHeaderLabel}>
              {snippet.language}
            </Text>
            <View style={styles.codeHeaderActions}>
         
              <TouchableOpacity
                style={styles.codeAction}
                onPress={handleExportPress}
                disabled={exporting}
              >
                <Text style={styles.codeActionText}>
                  {exporting ? '...' : '↑ Export'}
                </Text>
              </TouchableOpacity>

         
              <TouchableOpacity
                style={[
                  styles.codeAction,
                  copied && styles.codeActionCopied,
                ]}
                onPress={handleCopy}
              >
                <Text style={[
                  styles.codeActionText,
                  copied && styles.codeActionCopiedText,
                ]}>
                  {copied ? '✓ Copied' : '⎘ Copy'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>


          <ScrollView
            horizontal
            showsHorizontalScrollIndicator
            style={styles.codeScrollH}
          >
            <Text style={styles.codeText} selectable>
              {snippet.code}
            </Text>
          </ScrollView>
        </View>

    
        <AIExplanationCard
          explanation={aiResult}
          loading={aiLoading}
          error={aiError}
          onRequest={handleAIExplain}
        />

    
        <View style={{ height: 40 }} />

      </ScrollView>
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  centered: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#555555',
    fontSize: 14,
  },


  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 15,
    color: '#f97316',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#FFD700',
  },
  deleteButton: {
    borderColor: '#FF6B6B',
  },
  deleteIcon: {
    fontSize: 15,
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    gap: 12,
  },

  titleSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },


  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 16,
  },
  tag: {
    backgroundColor: '#1f1f1f',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    color: '#f97316',
  },
  timestamp: {
    fontSize: 12,
    color: '#555555',
    paddingHorizontal: 16,
  },


  codeCard: {
    marginHorizontal: 16,
    backgroundColor: '#0f0f0f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    backgroundColor: '#141414',
  },
  codeHeaderLabel: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  codeHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  codeAction: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1f1f1f',
  },
  codeActionCopied: {
    borderColor: '#f97316',
    backgroundColor: '#1f1200',
  },
  codeActionText: {
    fontSize: 12,
    color: '#888888',
    fontWeight: '600',
  },
  codeActionCopiedText: {
    color: '#f97316',
  },
  codeScrollH: {
    padding: 14,
  },
  codeText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'monospace',
    lineHeight: 22,
  },
});