import js from "@eslint/js";
export default [js.configs.recommended, { files:["src/**/*.js","src/**/*.jsx"], languageOptions:{ globals:{ window:"readonly", document:"readonly", confirm:"readonly", setTimeout:"readonly" } }, rules:{ "no-unused-vars":["warn",{argsIgnorePattern:"^_"}] } }];
