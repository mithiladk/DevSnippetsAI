import { useTheme } from "@/context/ThemeContext";
import {
  AIProvider,
  deleteAPIKey,
  getAPIKey,
  saveAPIKey,
} from "@/services/aiService";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PROVIDERS: { label: string; value: AIProvider; hint: string }[] = [
  {
    label: "Anthropic (Claude)",
    value: "anthropic",
    hint: "Get key at console.anthropic.com",
  },
  {
    label: "OpenAI (GPT-4o)",
    value: "openai",
    hint: "Get key at platform.openai.com",
  },
  {
    label: "Google (Gemini)",
    value: "gemini",
    hint: "Get key at aistudio.google.com",
  },
  {
    label: "Groq (Free! ⚡)",
    value: "groq",
    hint: "Get free key at console.groq.com",
  },
];

export default function Settings() {
  const { colors, theme, setTheme } = useTheme();
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [apiKey, setApiKey] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasKey, setHasKey] = useState(false);

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
        console.error("[Settings] load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave() {
    if (!apiKey.trim()) {
      Alert.alert("Missing Key", "Please enter an API key.");
      return;
    }
    try {
      setSaving(true);
      await saveAPIKey(apiKey.trim(), provider);
      setHasKey(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      Alert.alert("Error", "Could not save API key.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    Alert.alert("Remove API Key", "AI features will stop working.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await deleteAPIKey();
          setApiKey("");
          setHasKey(false);
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.bg }]}
      edges={["top"]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Settings
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtext }]}>
            Configure AI features
          </Text>
        </View>

        <View
          style={[
            styles.banner,
            hasKey ? styles.bannerActive : styles.bannerInactive,
          ]}
        >
          <Text style={styles.bannerText}>
            {hasKey
              ? "✓ AI features are active"
              : "⚠ No API key — AI features disabled"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            AI PROVIDER
          </Text>
          {PROVIDERS.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.providerRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                provider === p.value && styles.providerRowActive,
              ]}
              onPress={() => setProvider(p.value)}
            >
              <View style={styles.providerLeft}>
                <View
                  style={[
                    styles.radio,
                    provider === p.value && styles.radioActive,
                  ]}
                >
                  {provider === p.value && <View style={styles.radioDot} />}
                </View>
                <View>
                  <Text style={[styles.providerLabel, { color: colors.text }]}>
                    {p.label}
                  </Text>
                  <Text
                    style={[
                      styles.providerHint,
                      {
                        color:
                          provider === p.value ? "#AAAAAA" : colors.subtext,
                      },
                    ]}
                  >
                    {p.hint}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            API KEY
          </Text>
          <TextInput
            style={[
              styles.keyInput,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-... or gsk_... paste your key here"
            placeholderTextColor={colors.subtext}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={[styles.keyHint, { color: colors.subtext }]}>
            Your key is stored securely using Expo SecureStore. It never leaves
            your phone.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            THEME
          </Text>
          <View style={styles.themeRow}>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                theme === "dark" && styles.themeBtnActive,
              ]}
              onPress={() => setTheme("dark")}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: theme === "dark" ? "#FFFFFF" : colors.text },
                ]}
              >
                🌙 Dark
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.themeBtn,
                { backgroundColor: colors.card, borderColor: colors.border },
                theme === "light" && styles.themeBtnActive,
              ]}
              onPress={() => setTheme("light")}
            >
              <Text
                style={[
                  styles.themeBtnText,
                  { color: theme === "light" ? "#FFFFFF" : colors.text },
                ]}
              >
                ☀️ Light
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: colors.primary },
            saved && styles.saveButtonSuccess,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save API Key"}
          </Text>
        </TouchableOpacity>

        {hasKey && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Remove API Key</Text>
          </TouchableOpacity>
        )}

        {/* ── About ── */}
        <View style={styles.aboutSection}>
          <Text style={[styles.sectionLabel, { color: colors.primary }]}>
            ABOUT
          </Text>
          <View
            style={[
              styles.aboutCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.aboutTitle, { color: colors.text }]}>
              DevSnippets AI
            </Text>
            <Text style={[styles.aboutText, { color: colors.subtext }]}>
              Offline-first code snippet manager with AI explanations. Built
              with Expo + SQLite + TypeScript.
            </Text>
            <Text style={[styles.aboutVersion, { color: colors.subtext }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 16, gap: 20, paddingBottom: 60 },
  header: { gap: 4, marginBottom: 4 },
  headerTitle: { fontSize: 24, fontWeight: "800" },
  headerSubtitle: { fontSize: 13 },
  banner: { borderRadius: 10, padding: 12, alignItems: "center" },
  bannerActive: {
    backgroundColor: "#1a1a00",
    borderWidth: 1,
    borderColor: "#f97316",
  },
  bannerInactive: {
    backgroundColor: "#1a0000",
    borderWidth: 1,
    borderColor: "#FF6B6B",
  },
  bannerText: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },
  section: { gap: 10 },
  sectionLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  providerRow: { borderRadius: 10, borderWidth: 1, padding: 14 },
  providerRowActive: { borderColor: "#f97316", backgroundColor: "#1f1200" },
  providerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#444444",
    justifyContent: "center",
    alignItems: "center",
  },
  radioActive: { borderColor: "#f97316" },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#f97316",
  },
  providerLabel: { fontSize: 14, fontWeight: "600" },
  providerHint: { fontSize: 12, marginTop: 2 },
  keyInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: "monospace",
  },
  keyHint: { fontSize: 12, lineHeight: 18 },
  saveButton: { borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  saveButtonSuccess: { backgroundColor: "#22c55e" },
  saveButtonText: { fontSize: 16, fontWeight: "700", color: "#FFFFFF" },
  deleteButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF6B6B",
    backgroundColor: "#1a0000",
  },
  deleteButtonText: { fontSize: 15, fontWeight: "600", color: "#FF6B6B" },
  aboutSection: { gap: 10 },
  aboutCard: { borderRadius: 12, borderWidth: 1, padding: 16, gap: 6 },
  aboutTitle: { fontSize: 15, fontWeight: "700" },
  aboutText: { fontSize: 13, lineHeight: 20 },
  aboutVersion: { fontSize: 12 },
  themeRow: { flexDirection: "row", gap: 12 },
  themeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
  },
  themeBtnActive: { borderColor: "#f97316", backgroundColor: "#1f1200" },
  themeBtnText: { fontWeight: "600" },
});
