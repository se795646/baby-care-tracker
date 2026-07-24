import vue from 'eslint-plugin-vue';
import prettier from 'eslint-plugin-prettier';
import babelParser from '@babel/eslint-parser';
import vueParser from 'vue-eslint-parser';
import globals from 'globals';

export default [
    {
        files: ['**/*.{js,vue}'],
        languageOptions: {
            parser: vueParser,
            parserOptions: {
                parser: babelParser,
                requireConfigFile: false,
                babelOptions: {
                    configFile: false,
                    babelrc: false
                },
                sourceType: 'module',
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser,
                ...globals.node
            },
            ecmaVersion: 'latest'
        },
        plugins: {
            vue,
            prettier
        },
        rules: {
            'no-console': 'warn',
            'no-debugger': 'error',
            'constructor-super': 'error',
            eqeqeq: 'error',
            'no-const-assign': 'error',
            'no-this-before-super': 'error',
            'no-undef': 'error',
            'no-unreachable': 'error',
            'no-unused-vars': 'error',
            'no-var': 'error',
            'prefer-const': 'error',
            'valid-typeof': 'error',
            'prettier/prettier': 'error'
        }
    },
    {
        files: ['**/*.vue'],
        rules: {
            'vue/require-expose': 'error',
            'vue/require-explicit-emits': 'error',
            'vue/no-unused-emit-declarations': 'error'
        }
    },
    {
        files: [
            '**/__tests__/*.{j,t}s?(x)',
            '**/test/unit/**/*.spec.{j,t}s?(x)'
        ],
        languageOptions: {
            globals: {
                ...globals.vitest
            }
        }
    }
];
