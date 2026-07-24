/** @type {import("prettier").Config} */
module.exports = {
    plugins: ['prettier-plugin-tailwindcss'],
    tailwindConfig: './tailwind.config.cjs',
    singleQuote: true,
    semi: true,
    tabWidth: 4,
    trailingComma: 'none',
    endOfLine: 'auto'
};
