import { SearchBar } from "@/components/SearchBar";
import { SnippetCard } from "@/components/SnippetCard";
import { useTheme } from "@/context/ThemeContext";
import { useSnippets } from "@/hooks/useSnippets";
import { router, useFocusEffect } from "expo-router";
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

export default function HomeScreen() {
  const { colors } = useTheme();
  const { snippets, loading, error, refresh, markFavorite } = useSnippets();
  const [query, setQuery] = useState("");

  const bg = colors?.bg ?? "#0A0A0A";
  const text = colors?.text ?? "#FFFFFF";
  const subtext = colors?.subtext ?? "#555555";
  const primary = colors?.primary ?? "#f97316";

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, []),
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return snippets;
    const q = query.toLowerCase();
    return snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q)) ||
        s.code.toLowerCase().includes(q),
    );
  }, [snippets, query]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.subtext }]}>
          Loading...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: bg }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: primary }]}
          onPress={refresh}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: bg }]}
      edges={["top", "bottom"]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: text }]}>DevSnippets</Text>
          <Text style={[styles.headerSubtitle, { color: subtext }]}>
            {snippets.length} snippet{snippets.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: primary }]}
          onPress={() => router.push("/snippet/create")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <SearchBar
        value={query}
        onChangeText={setQuery}
        onClear={() => setQuery("")}
      />

      {query.trim() !== "" && (
        <Text style={[styles.resultsLabel, { color: subtext }]}>
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
            onPress={(s) => router.push(`/snippet/${s.id}`)}
            onLongPress={(s) => markFavorite(s.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
        onRefresh={refresh}
        refreshing={loading}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>{query ? "🔍" : "📋"}</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {query ? "No results found" : "No snippets yet"}
            </Text>
            <Text style={[styles.emptySubtitle, { color: subtext }]}>
              {query
                ? `Nothing matched "${query}"`
                : "Tap + to save your first snippet"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  headerTitle: { fontSize: 24, fontWeight: "800", letterSpacing: 0.5 },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    fontSize: 28,
    color: "#FFFFFF",
    lineHeight: 32,
    fontWeight: "400",
  },
  resultsLabel: { fontSize: 12, paddingHorizontal: 16, marginBottom: 4 },
  listContent: { paddingBottom: 100, flexGrow: 1 },
  loadingText: { fontSize: 14 },
  errorText: {
    color: "#FF6B6B",
    fontSize: 15,
    textAlign: "center",
    marginHorizontal: 32,
  },
  retryButton: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#FFFFFF", fontWeight: "600" },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontWeight: "700" },
  emptySubtitle: { fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
});
