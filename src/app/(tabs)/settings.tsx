

import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  saveAPIKey, getAPIKey, deleteAPIKey, AIProvider,
} from '@/services/aiService';

const PROVIDERS: { label: string; value: AIProvider; hint: string }[] = [
  { label: 'Anthropic (Claude)', value: 'anthropic', hint: 'Get key at console.anthropic.com' },
  { label: 'OpenAI (GPT-4o)',    value: 'openai',    hint: 'Get key at platform.openai.com'  },
  { label: 'Google (Gemini)',    value: 'gemini',    hint: 'Get key at aistudio.google.com'   },
];

export default function Settings() {
  const [provider, setProvider]   = useState<AIProvider>('anthropic');
  const [apiKey, setApiKey]       = useState('');
  const [saved, setSaved]         = useState(false);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [hasKey, setHasKey]       = useState(false);


  useEffect(() => {
    async function load() {
      try {
        const { key, provider: savedProvider } = await getAPIKey();
        if (key && savedProvider) {
          setHasKey(true);
          setProvider(savedProvider);
          setApiKey(key);
        }
      } catch (e) {
        console.error('[Settings] load key error:', e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!apiKey.trim()) {
      Alert.alert('Missing Key', 'Please enter an API key.');
      return;
    }
    try {
      setSaving(true);
      await saveAPIKey(apiKey.trim(), provider);
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      Alert.alert('Error', 'Could not save API key.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert(
      'Remove API Key',
      'This will remove your saved API key. AI features will stop working.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteAPIKey();
            setApiKey('');
            setHasKey(false);
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Configure AI features</Text>
        </View>

   
        <View style={[styles.banner, hasKey ? styles.bannerActive : styles.bannerInactive]}>
          <Text style={styles.bannerText}>
            {hasKey ? '✓ AI features are active' : '⚠ No API key — AI features disabled'}
          </Text>
        </View>

   
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI PROVIDER</Text>
          {PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[styles.providerRow, provider === p.value && styles.providerRowActive]}
              onPress={() => setProvider(p.value)}
            >
              <View style={styles.providerLeft}>
                <View style={[styles.radio, provider === p.value && styles.radioActive]}>
                  {provider === p.value && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[styles.providerLabel, provider === p.value && styles.providerLabelActive]}>
                    {p.label}
                  </Text>
                  <Text style={styles.providerHint}>{p.hint}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

    
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>API KEY</Text>
          <TextInput
            style={styles.keyInput}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-... or AI... paste your key here"
            placeholderTextColor="#444444"
            autoCapitalize="none"
            autoCorrect={false}
            secureTextEntry={false}
            multiline={false}
          />
          <Text style={styles.keyHint}>
            Your key is stored securely on device using Expo SecureStore.
            It never leaves your phone.
          </Text>
        </View>

    
        <TouchableOpacity
          style={[styles.saveButton, saved && styles.saveButtonSuccess]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save API Key'}
          </Text>
        </TouchableOpacity>

    
        {hasKey && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Remove API Key</Text>
          </TouchableOpacity>
        )}

    
        <View style={styles.aboutSection}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <View style={styles.aboutCard}>
            <Text style={styles.aboutTitle}>DevSnippets AI</Text>
            <Text style={styles.aboutText}>
              Offline-first code snippet manager with AI explanations.
              Built with Expo + SQLite + TypeScript.
            </Text>
            <Text style={styles.aboutVersion}>Version 1.0.0</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea:   { flex: 1, backgroundColor: '#0A0A0A' },
  centered:   { flex: 1, backgroundColor: '#0A0A0A', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 60 },


  header:         { gap: 4, marginBottom: 4 },
  headerTitle:    { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#555555' },


  banner:         { borderRadius: 10, padding: 12, alignItems: 'center' },
  bannerActive:   { backgroundColor: '#1a1a00', borderWidth: 1, borderColor: '#f97316' },
  bannerInactive: { backgroundColor: '#1a0000', borderWidth: 1, borderColor: '#FF6B6B' },
  bannerText:     { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },


  section:      { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#f97316', letterSpacing: 1.5 },


  providerRow: {
    backgroundColor: '#141414', borderRadius: 10,
    borderWidth: 1, borderColor: '#2a2a2a', padding: 14,
  },
  providerRowActive: { borderColor: '#f97316', backgroundColor: '#1f1200' },
  providerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#444444',
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive:        { borderColor: '#f97316' },
  radioDot:           { width: 10, height: 10, borderRadius: 5, backgroundColor: '#f97316' },
  providerLabel:      { fontSize: 14, fontWeight: '600', color: '#888888' },
  providerLabelActive:{ color: '#FFFFFF' },
  providerHint:       { fontSize: 12, color: '#555555', marginTop: 2 },


  keyInput: {
    backgroundColor: '#141414', borderWidth: 1, borderColor: '#2a2a2a',
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: '#FFFFFF', fontFamily: 'monospace',
  },
  keyHint: { fontSize: 12, color: '#555555', lineHeight: 18 },


  saveButton: {
    backgroundColor: '#f97316', borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  saveButtonSuccess: { backgroundColor: '#22c55e' },
  saveButtonText:    { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  deleteButton: {
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
    borderWidth: 1, borderColor: '#FF6B6B', backgroundColor: '#1a0000',
  },
  deleteButtonText: { fontSize: 15, fontWeight: '600', color: '#FF6B6B' },

  // ── About ──
  aboutSection: { gap: 10 },
  aboutCard: {
    backgroundColor: '#141414', borderRadius: 12,
    borderWidth: 1, borderColor: '#2a2a2a', padding: 16, gap: 6,
  },
  aboutTitle:   { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  aboutText:    { fontSize: 13, color: '#888888', lineHeight: 20 },
  aboutVersion: { fontSize: 12, color: '#444444' },
});