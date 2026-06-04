import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Snippet } from '@/types';
import { LanguageBadge } from '@/components/LanguageBadge';
import { useTheme } from '@/context/ThemeContext';

interface SnippetCardProps {
  snippet: Snippet;
  onPress: (snippet: Snippet) => void;
  onLongPress?: (snippet: Snippet) => void;
}

export function SnippetCard({ snippet, onPress, onLongPress }: SnippetCardProps) {
  const { colors } = useTheme();
  const timeAgo = formatTimeAgo(snippet.updatedAt);
  const previewCode = snippet.code.slice(0, 100).replace(/\n/g, ' ');
  const hasTags = snippet.tags && snippet.tags.length > 0;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => onPress(snippet)}
      onLongPress={() => onLongPress?.(snippet)}
      activeOpacity={0.75}
    >
      <View style={styles.topRow}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {snippet.title}
        </Text>
        {snippet.isFavorite && <Text style={styles.favoriteIcon}>★</Text>}
      </View>

      <LanguageBadge language={snippet.language} size="sm" />

      <Text style={[styles.codePreview, { backgroundColor: colors.code, color: colors.subtext }]} numberOfLines={2}>
        {previewCode}
      </Text>

      {hasTags && (
        <View style={styles.tagsRow}>
          {snippet.tags.slice(0, 3).map((tag) => (
            <View key={tag} style={[styles.tag, { backgroundColor: colors.tagBg }]}>
              <Text style={[styles.tagText, { color: colors.tagText }]}>#{tag}</Text>
            </View>
          ))}
          {snippet.tags.length > 3 && (
            <Text style={[styles.moreTags, { color: colors.subtext }]}>+{snippet.tags.length - 3}</Text>
          )}
        </View>
      )}

      <Text style={[styles.timeAgo, { color: colors.subtext }]}>{timeAgo}</Text>
    </TouchableOpacity>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours   = Math.floor(diff / (1000 * 60 * 60));
  const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (minutes < 1)  return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  if (days    < 7)  return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

const styles = StyleSheet.create({
  card:         { borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 6, gap: 8, borderWidth: 1 },
  topRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title:        { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  favoriteIcon: { fontSize: 16, color: '#FFD700' },
  codePreview:  { fontSize: 12, fontFamily: 'monospace', padding: 8, borderRadius: 6 },
  tagsRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag:          { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 },
  tagText:      { fontSize: 11 },
  moreTags:     { fontSize: 11, alignSelf: 'center' },
  timeAgo:      { fontSize: 11, textAlign: 'right' },
});