

import { View, Text, StyleSheet } from 'react-native';
import { getLanguageByValue } from '@/constants/languages';


interface LanguageBadgeProps {
  language: string;
  size?: 'sm' | 'md';
}


export function LanguageBadge({ language, size = 'md' }: LanguageBadgeProps) {
  // Single source of truth — pulls from languages.ts
  const lang = getLanguageByValue(language);
  const bg        = lang?.color     ?? '#444444';
  const textColor = lang?.textColor ?? '#FFFFFF';
  const isSmall   = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: bg }, isSmall && styles.badgeSm]}>
      <Text style={[styles.text, { color: textColor }, isSmall && styles.textSm]}>
        {language.toLowerCase()}
      </Text>
    </View>
  );
}


const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  textSm: {
    fontSize: 11,
  },
});