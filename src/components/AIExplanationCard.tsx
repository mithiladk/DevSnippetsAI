

import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { AIExplanation } from '@/types';



interface AIExplanationCardProps {
  explanation: AIExplanation | null;
  loading: boolean;
  error: string | null;
  onRequest: () => void;
}



export function AIExplanationCard({
  explanation,
  loading,
  error,
  onRequest,
}: AIExplanationCardProps) {

  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✦</Text>
          <Text style={styles.headerTitle}>AI Explanation</Text>
        </View>
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#f97316" />
          <Text style={styles.loadingText}>Analyzing your code...</Text>
        </View>
      </View>
    );
  }


  if (error) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✦</Text>
          <Text style={styles.headerTitle}>AI Explanation</Text>
        </View>
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRequest}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  if (!explanation) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>✦</Text>
          <Text style={styles.headerTitle}>AI Explanation</Text>
        </View>
        <Text style={styles.emptyText}>
          Let AI explain what this code does, and suggest improvements.
        </Text>
        <TouchableOpacity style={styles.explainButton} onPress={onRequest}>
          <Text style={styles.explainButtonText}>✦ Explain This Code</Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <View style={styles.card}>

      {/* ── Header row with collapse toggle ── */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded((prev) => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.headerIcon}>✦</Text>
        <Text style={styles.headerTitle}>AI Explanation</Text>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>


      {expanded && (
        <View style={styles.content}>

          {/* Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>SUMMARY</Text>
            <Text style={styles.summaryText}>{explanation.summary}</Text>
          </View>

          <View style={styles.divider} />

        
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>EXPLANATION</Text>
            <Text style={styles.explanationText}>
              {explanation.explanation}
            </Text>
          </View>

 
          <View style={styles.divider} />

   
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>IMPROVEMENTS</Text>
            {explanation.improvements.map((item, index) => (
              <View key={index} style={styles.improvementRow}>
                <Text style={styles.bullet}>→</Text>
                <Text style={styles.improvementText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Re-analyze button */}
          <TouchableOpacity
            style={styles.reAnalyzeButton}
            onPress={onRequest}
          >
            <Text style={styles.reAnalyzeText}>↺ Re-analyze</Text>
          </TouchableOpacity>

        </View>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  card: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f97316',      
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },

 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 8,
  },
  headerIcon: {
    fontSize: 14,
    color: '#f97316',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#f97316',
    flex: 1,
    letterSpacing: 0.5,
  },
  chevron: {
    fontSize: 11,
    color: '#f97316',
  },


  loadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  loadingText: {
    color: '#888888',
    fontSize: 13,
  },

  errorBox: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 10,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 13,
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#1f1f1f',
    borderWidth: 1,
    borderColor: '#f97316',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  retryText: {
    color: '#f97316',
    fontSize: 13,
    fontWeight: '600',
  },


  emptyText: {
    color: '#555555',
    fontSize: 13,
    lineHeight: 18,
    paddingHorizontal: 14,
    paddingBottom: 12,
  },
  explainButton: {
    backgroundColor: '#f97316',
    marginHorizontal: 14,
    marginBottom: 14,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  explainButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },


  content: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 12,
  },
  section: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#f97316',
    letterSpacing: 1.5,          
  },
  summaryText: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  explanationText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#2a2a2a',
  },


  improvementRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    color: '#f97316',
    fontSize: 13,
    marginTop: 1,
  },
  improvementText: {
    flex: 1,
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 20,
  },

  // ── Re-analyze ──
  reAnalyzeButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  reAnalyzeText: {
    fontSize: 12,
    color: '#555555',
  },
});