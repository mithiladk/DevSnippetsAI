import { useTheme } from "@/context/ThemeContext";
import { useRef } from "react";
import {
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export function SearchBar({
  value,
  onChangeText,
  onClear,
  placeholder = "Search snippets...",
  autoFocus = false,
}: SearchBarProps) {
  const inputRef = useRef<TextInput>(null);
  const { colors } = useTheme();
  const bg = colors?.bg ?? "#0A0A0A";
  const card = colors?.card ?? "#141414";
  const border = colors?.border ?? "#2a2a2a";
  const text = colors?.text ?? "#FFFFFF";
  const subtext = colors?.subtext ?? "#555555";

  const hasText = value.length > 0;

  function handleClear() {
    onClear();
    inputRef.current?.focus();
  }

  function handleSubmit() {
    Keyboard.dismiss();
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: card,
          borderColor: border,
        },
      ]}
    >
      <View style={styles.iconBox}>
        <TextInput
          style={[styles.input, { color: text }]}
          placeholderTextColor={subtext}
          value="🔍"
          editable={false}
        />
      </View>

      <TextInput
        ref={inputRef}
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#555570"
        autoFocus={autoFocus}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
        clearButtonMode="never"
      />

      {hasText && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <View style={styles.clearCircle}>
            <TextInput style={styles.clearIcon} value="✕" editable={false} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    height: 46,
  },
  iconBox: {
    marginRight: 8,
  },
  icon: {
    fontSize: 16,
    color: "#444444",
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: "#FFFFFF",
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  clearCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#2a2a2a", // dark grey circle
    justifyContent: "center",
    alignItems: "center",
  },
  clearIcon: {
    fontSize: 10,
    color: "#888888",
    textAlign: "center",
  },
});
