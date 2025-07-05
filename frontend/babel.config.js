// frontend/babel.config.js
// Babel configuration for Jest and Next.js (React + TypeScript)
module.exports = {
  presets: [
    "@babel/preset-env",
    ["@babel/preset-react", { runtime: "automatic" }],
    "@babel/preset-typescript",
  ],
};
