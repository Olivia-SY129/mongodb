module.exports = {
  env: {
    node: true,
    browser: true,
    es2020: true
  },
  plugins: ["eslint"],
  extends: [
    "airbnb-base",
    "plugin:node/recommended",
    "prettier/@typescript-eslint",
    "prettier"
  ]
};
