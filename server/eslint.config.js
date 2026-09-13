import js from "@eslint/js";
export default [js.configs.recommended, { files:["src/**/*.js"], languageOptions:{ globals:{ process:"readonly", console:"readonly" } }, rules:{ "no-unused-vars":["warn",{argsIgnorePattern:"^_"}] } }];
