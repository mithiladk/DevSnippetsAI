// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Tell Metro to treat .wasm files as assets
config.resolver.assetExts.push('wasm');

module.exports = config;