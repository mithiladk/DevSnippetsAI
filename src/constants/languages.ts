
export interface Language {
  label: string;
  value: string;
  color: string;       // badge background color
  textColor: string;   // badge text color — light bg needs dark text
  icon: string;
}

export const LANGUAGES: Language[] = [
  { label: 'JavaScript', value: 'javascript', color: '#F7DF1E', textColor: '#000000', icon: '🟨' },
  { label: 'TypeScript', value: 'typescript', color: '#3178C6', textColor: '#FFFFFF', icon: '🔷' },
  { label: 'Python',     value: 'python',     color: '#3572A5', textColor: '#FFFFFF', icon: '🐍' },
  { label: 'Java',       value: 'java',       color: '#B07219', textColor: '#FFFFFF', icon: '☕' },
  { label: 'C++',        value: 'cpp',        color: '#F34B7D', textColor: '#FFFFFF', icon: '⚙️' },
  { label: 'Rust',       value: 'rust',       color: '#DEA584', textColor: '#000000', icon: '🦀' },
  { label: 'Go',         value: 'go',         color: '#00ADD8', textColor: '#FFFFFF', icon: '🐹' },
  { label: 'Swift',      value: 'swift',      color: '#F05138', textColor: '#FFFFFF', icon: '🍎' },
  { label: 'Kotlin',     value: 'kotlin',     color: '#A97BFF', textColor: '#FFFFFF', icon: '🎯' },
  { label: 'CSS',        value: 'css',        color: '#563D7C', textColor: '#FFFFFF', icon: '🎨' },
  { label: 'HTML',       value: 'html',       color: '#E34C26', textColor: '#FFFFFF', icon: '🌐' },
  { label: 'SQL',        value: 'sql',        color: '#E38C00', textColor: '#FFFFFF', icon: '🗃️' },
  { label: 'Bash',       value: 'bash',       color: '#89E051', textColor: '#000000', icon: '💻' },
  { label: 'JSON',       value: 'json',       color: '#292929', textColor: '#FFFFFF', icon: '📦' },
  { label: 'Dart',       value: 'dart',       color: '#00B4AB', textColor: '#FFFFFF', icon: '🎯' },
  { label: 'Other',      value: 'other',      color: '#444444', textColor: '#FFFFFF', icon: '📄' },
];

export function getLanguageByValue(value: string): Language | undefined {
  return LANGUAGES.find((l) => l.value === value.toLowerCase().trim());
}