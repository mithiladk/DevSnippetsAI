import { SearchBar } from "@/components/SearchBar";
import { SnippetCard } from "@/components/SnippetCard";
import { useSnippets } from "@/hooks/useSnippets";
import { Snippet } from "@/types";
import { router,useFocusEffect  } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/context/ThemeContext";


export default function FavoritesScreen() {
  const { favorites, loading, error, refresh, markFavorite } = useSnippets();
  useFocusEffect(
  useCallback(() => {
    refresh();
  }, [])
);

  const [query, setQuery] = useState("");
    const { colors } = useTheme();
  const bg      = colors?.bg      ?? '#0A0A0A';
  const text    = colors?.text    ?? '#FFFFFF';
  const subtext = colors?.subtext ?? '#555555';
  const primary = colors?.primary ?? '#f97316';


  const filtered = useMemo(() => {
    if (!query.trim()) return favorites;
    const q = query.toLowerCase();
    return favorites.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.code.toLowerCase().includes(q),
    );
  }, [favorites, query]);

  function handlePress(snippet: Snippet) {
    router.push(`/snippet/${snippet.id}`);
  }

  function handleLongPress(snippet: Snippet) {
    // long press removes from favorites
    markFavorite(snippet.id);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
        <Text style={styles.loadingText}>Loading favorites...</Text>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bg }]} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: text }]}>Favorites</Text>
          <Text style={[styles.headerSubtitle, { color: subtext }]}>
            {favorites.length} snippet{favorites.length !== 1 ? "s" : ""}{" "}
            starred
          </Text>
        </View>

        <View style={styles.iconBox}>
          <Text style={styles.headerIcon}>★</Text>
        </View>
      </View>

      {favorites.length > 0 && (
        <SearchBar
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery("")}
          placeholder="Search favorites..."
        />
      )}

      {query.trim() !== "" && (
        <Text style={styles.resultsLabel}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""} for "
          {query}"
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
            {query ? (
              // ── Empty because search found nothing ──
              <>
                <Text style={styles.emptyIcon}>🔍</Text>
                <Text style={styles.emptyTitle}>No results found</Text>
                <Text style={styles.emptySubtitle}>
                  Nothing matched "{query}"
                </Text>
              </>
            ) : (
         
              <>
                <Text style={styles.emptyIcon}>☆</Text>
                <Text style={styles.emptyTitle}>No favorites yet</Text>
                <Text style={styles.emptySubtitle}>
                  Long press any snippet to star it
                </Text>
                <TouchableOpacity
                  style={styles.browseButton}
                  onPress={() => router.push("/")}
                >
                  <Text style={styles.browseButtonText}>Browse Snippets</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#555555",
    marginTop: 2,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1f1f1f",
    justifyContent: "center",
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 20,
    color: "#FFD700",
  },

  resultsLabel: {
    fontSize: 12,
    color: "#555555",
    paddingHorizontal: 16,
    marginBottom: 4,
  },

  listContent: {
    paddingBottom: 100,
    flexGrow: 1,
  },

  centered: {
    flex: 1,
    backgroundColor: "#0A0A0A",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    color: "#555555",
    fontSize: 14,
  },

  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
    textAlign: "center",
    marginHorizontal: 32,
  },
  retryButton: {
    backgroundColor: "#f97316",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    paddingHorizontal: 32,
  },
  browseButton: {
    marginTop: 16,
    backgroundColor: "#f97316",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});
