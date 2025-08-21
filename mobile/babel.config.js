// mobile/babel.config.js
// Babel configuration with modern transform plugins

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { jsxImportSource: "react" }]],
    plugins: [
      // Modern transform plugins instead of deprecated proposal plugins
      "@babel/plugin-transform-class-properties",
      "@babel/plugin-transform-numeric-separator",
      "@babel/plugin-transform-optional-chaining",
      "@babel/plugin-transform-object-rest-spread",
      "@babel/plugin-transform-optional-catch-binding",
      "@babel/plugin-transform-async-generator-functions",
      "@babel/plugin-transform-nullish-coalescing-operator",
      "@babel/plugin-transform-arrow-functions",
      "@babel/plugin-transform-shorthand-properties",
      "@babel/plugin-transform-template-literals",

      // React Native specific plugins
      "react-native-reanimated/plugin",
    ],
  };
};
