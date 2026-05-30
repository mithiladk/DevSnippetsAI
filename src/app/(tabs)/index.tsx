
import { useState, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router,useFocusEffect  } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSnippets } from '@/hooks/useSnippets';
import { SnippetCard } from '@/components/SnippetCard';
import { SearchBar } from '@/components/SearchBar';
import { Snippet } from '@/types';



export default function HomeScreen() {
  const {
    snippets,
    loading,
    error,
    refresh,
    removeSnippet,
    markFavorite,
  } = useSnippets();

  useFocusEffect(
  useCallback(() => {
    refresh();
  }, [])
);
  const [query, setQuery] = useState('');


  const filtered = useMemo(() => {
    if (!query.trim()) return snippets;
    const q = query.toLowerCase();
    return snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.code.toLowerCase().includes(q)
    );
  }, [snippets, query]);



  function handlePress(snippet: Snippet) {
    router.push(`/snippet/${snippet.id}`);
  }

  function handleLongPress(snippet: Snippet) {
    markFavorite(snippet.id);
  }

  function handleAddPress() {
    router.push('/snippet/create');
  }


  if (loading) {
    return (
      <View style={styles.centered}>
      <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading snippets...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refresh}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }



  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>

    
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>DevSnippets</Text>
          <Text style={styles.headerSubtitle}>
            {snippets.length} snippet{snippets.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

  
      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery('')}
      />


      {query.trim() !== '' && (
        <Text style={styles.resultsLabel}>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{query}"
        </Text>
      )}


      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SnippetCard
            snippet={item}
            onPress={handlePress}
            onLongPress={handleLongPress}
          />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refresh}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>
              {query ? '🔍' : '📋'}
            </Text>
            <Text style={styles.emptyTitle}>
              {query ? 'No results found' : 'No snippets yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {query
                ? `Nothing matched "${query}"`
                : 'Tap + to save your first snippet'}
            </Text>
          </View>
        }
      />

    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },


  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#555570',
    marginTop: 2,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 28,
    color: '#FFFFFF',
    lineHeight: 32,
    fontWeight: '400',
  },


  resultsLabel: {
    fontSize: 12,
    color: '#555570',
    paddingHorizontal: 16,
    marginBottom: 4,
  },


  listContent: {
    paddingBottom: 100,   
    flexGrow: 1,
  },


  centered: {
    flex: 1,
    backgroundColor: '#12121E',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#555570',
    fontSize: 14,
  },


  errorText: {
    color: '#FF6B6B',
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },


  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#555570',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});