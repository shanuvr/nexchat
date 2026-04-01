// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for .mjs files, commonly used by modern packages like socket.io-client
config.resolver.sourceExts.push('mjs');

module.exports = config;
