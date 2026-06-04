import { LANGUAGES } from "@/constants/languages";
import { useSnippets } from "@/hooks/useSnippets";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LanguageBadge } from "../../components/LanguageBadge";

export default function CreateSnippet() {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [tagsInput, setTagsInput] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [saving, setSaving] = useState(false);

  const { addSnippet } = useSnippets();

  function parseTags(input: string): string[] {
    return input
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter((t) => t.length > 0);
  }

  function isFormValid(): boolean {
    return title.trim().length > 0 && code.trim().length > 0;
  }

  function handleSave() {
    if (!isFormValid()) {
      Alert.alert(
        "Missing Fields",
        "Please enter a title and code before saving.",
        [{ text: "OK" }],
      );
      return;
    }

    try {
      setSaving(true);
      addSnippet({
        title: title.trim(),
        code: code.trim(),
        language,
        tags: parseTags(tagsInput),
        isFavorite,
        screenshotUri: undefined,
        aiExplanation: undefined,
      });
      router.back();
    } catch (e) {
      Alert.alert("Error", "Failed to save snippet. Please try again.");
      console.error("[CreateSnippet] save error:", e);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (title.trim() || code.trim()) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Snippet</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.headerButton, styles.saveButton]}
            disabled={saving}
          >
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.field}>
            <Text style={styles.label}>TITLE *</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Fetch with retry"
              placeholderTextColor="#444444"
              autoFocus
              returnKeyType="next"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>LANGUAGE</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.languageRow}
               keyboardShouldPersistTaps="handled" 
            >
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.value}
                  onPress={() => setLanguage(lang.value)}
                    activeOpacity={0.6}    
                  style={[
                    styles.languageChip,
                    language === lang.value && styles.languageChipActive,
                  ]}
                >
                  <Text style={styles.languageIcon}>{lang.icon}</Text>
                  <Text
                    style={[
                      styles.languageChipText,
                      language === lang.value && styles.languageChipTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.badgePreview}>
              <LanguageBadge language={language} size="sm" />
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CODE *</Text>
            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              placeholder="Paste or type your code here..."
              placeholderTextColor="#444444"
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>TAGS</Text>
            <TextInput
              style={styles.input}
              value={tagsInput}
              onChangeText={setTagsInput}
              placeholder="react, hooks, async  (comma separated)"
              placeholderTextColor="#444444"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
            />

            {tagsInput.trim().length > 0 && (
              <View style={styles.tagsPreview}>
                {parseTags(tagsInput).map((tag) => (
                  <View key={tag} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Favorite toggle ── */}
          <TouchableOpacity
            style={styles.favoriteRow}
            onPress={() => setIsFavorite((prev) => !prev)}
            activeOpacity={0.7}
          >
            <View style={styles.favoriteLeft}>
              <Text style={styles.favoriteIcon}>{isFavorite ? "★" : "☆"}</Text>
              <View>
                <Text style={styles.favoriteLabel}>Add to Favorites</Text>
                <Text style={styles.favoriteSubtitle}>
                  Star this snippet for quick access
                </Text>
              </View>
            </View>
            {/* Toggle indicator */}
            <View style={[styles.toggle, isFavorite && styles.toggleActive]}>
              <View
                style={[
                  styles.toggleThumb,
                  isFavorite && styles.toggleThumbActive,
                ]}
              />
            </View>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#0A0A0A",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#2a2a2a",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 70,
    alignItems: "center",
  },
  cancelText: {
    fontSize: 15,
    color: "#888888",
  },
  saveButton: {
    backgroundColor: "#f97316",
  },
  saveText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 24,
    paddingBottom: 60,
  },

  field: {
    gap: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f97316",
    letterSpacing: 1.5,
  },
  input: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#FFFFFF",
  },
  codeInput: {
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: "#FFFFFF",
    fontFamily: "monospace",
    minHeight: 200,
    textAlignVertical: "top",
  },

  languageRow: {
    gap: 8,
    paddingVertical: 4,
  },
  languageChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#141414",
  },
  languageChipActive: {
    borderColor: "#f97316",
    backgroundColor: "#1f1200",
  },
  languageIcon: {
    fontSize: 14,
  },
  languageChipText: {
    fontSize: 13,
    color: "#888888",
  },
  languageChipTextActive: {
    color: "#f97316",
    fontWeight: "600",
  },
  badgePreview: {
    marginTop: 4,
  },

  tagsPreview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 4,
  },
  tag: {
    backgroundColor: "#1f1f1f",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 12,
    color: "#f97316",
  },

  favoriteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    padding: 14,
  },
  favoriteLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  favoriteIcon: {
    fontSize: 22,
    color: "#FFD700",
  },
  favoriteLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  favoriteSubtitle: {
    fontSize: 12,
    color: "#555555",
    marginTop: 2,
  },
  toggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#2a2a2a",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  toggleActive: {
    backgroundColor: "#f97316",
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#888888",
  },
  toggleThumbActive: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-end",
  },
});
