import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import configPrettier from 'eslint-config-prettier'

/**
 * Fronteiras da Clean Architecture.
 *
 * A regra de dependência aponta sempre para dentro:
 *
 *   presentation ──> application ──> domain <── data
 *
 * O domain e o núcleo e nao conhece ninguem. A composicao das camadas
 * (unico ponto que pode instanciar `data` e entregar para `presentation`)
 * vive em `<modulo>/factories/`.
 *
 * `factories/` e a UNICA porta de entrada para `data/` dentro de um modulo —
 * qualquer outro arquivo que tente importar de `data/` quebra o lint.
 */
const FRAMEWORKS = ['vue', 'vue-router', 'pinia', 'axios', 'vue-demi']

/**
 * Rede de seguranca aplicada a TODO arquivo de modulo. As regras por camada
 * abaixo sobrescrevem esta, e todas ja repetem a proibicao de `data/` — o que
 * sobra aqui sao os arquivos fora das camadas conhecidas (ex: soltos na raiz
 * do modulo), que de outra forma ficariam sem nenhuma restricao.
 */
const denyDataAccess = {
  patterns: [
    {
      group: ['**/data/**'],
      message:
        'Somente <modulo>/factories/ pode importar de data/. Use a factory do modulo.',
    },
  ],
}

const denyDomain = {
  patterns: [
    {
      group: [...FRAMEWORKS],
      message:
        'domain/ nao pode depender de framework. Mantenha o dominio puro (so TypeScript).',
    },
    {
      group: ['**/data/**', '**/application/**', '**/presentation/**'],
      message:
        'domain/ e a camada mais interna — nao pode importar de camadas externas.',
    },
  ],
}

const denyApplication = {
  patterns: [
    {
      group: [...FRAMEWORKS],
      message:
        'application/ nao pode depender de framework. Use Cases nao sabem que existe Vue.',
    },
    {
      group: ['**/data/**', '**/presentation/**'],
      message:
        'application/ depende apenas de domain/ (interfaces). O repositorio concreto e injetado.',
    },
  ],
}

const denyData = {
  patterns: [
    {
      group: ['vue', 'vue-router', 'pinia', 'vue-demi'],
      message:
        'data/ nao pode depender de Vue/Pinia/Router. Essa camada so fala HTTP e mapeamento.',
    },
    {
      group: ['**/presentation/**'],
      message: 'data/ nao pode importar de presentation/.',
    },
  ],
}

const denyPresentation = {
  patterns: [
    {
      group: ['**/data/**'],
      message:
        'presentation/ nao instancia repositorio. Use a factory do modulo (factories/<modulo>.factory.ts).',
    },
  ],
}

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'coverage/**', '*.config.js'] },

  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{ts,vue}'],
    languageOptions: {
      globals: { ...globals.browser },
      parserOptions: {
        parser: tseslint.parser,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'vue/multi-word-component-names': 'off',
      // O TypeScript ja resolve identificadores; `no-undef` gera falso positivo
      // com tipos globais do DOM (EventListener, RequestInit, ...).
      'no-undef': 'off',
    },
  },

  // ---- Fronteiras por camada ----
  // Catch-all primeiro: as regras seguintes sobrescrevem por camada.
  {
    files: ['src/modules/**/*.{ts,vue}'],
    rules: { 'no-restricted-imports': ['error', denyDataAccess] },
  },
  {
    files: ['src/modules/*/domain/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', denyDomain] },
  },
  {
    files: ['src/modules/*/application/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', denyApplication] },
  },
  {
    files: ['src/modules/*/data/**/*.ts'],
    rules: { 'no-restricted-imports': ['error', denyData] },
  },
  {
    files: ['src/modules/*/presentation/**/*.{ts,vue}'],
    rules: { 'no-restricted-imports': ['error', denyPresentation] },
  },

  // factories/ e o composition root: e o unico autorizado a costurar
  // data/ com application/ e presentation/.
  {
    files: ['src/modules/*/factories/**/*.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // Testes podem importar qualquer camada para montar cenarios.
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },

  // Prettier e a autoridade em formatacao — desliga regras de estilo do ESLint.
  configPrettier,
)
