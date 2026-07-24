/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './public/**/*.html',
        './src/**/*.{vue,js,ts,jsx,tsx}'
    ],
    prefix: 'bq-',
    theme: {
        extend: {
            colors: {
                // 提供符合原本 template 可能會用的部分特有顏色
                'gray-8': '#1f2937', // 相當於 gray-800
                'gray-5': '#6b7280', // 相當於 gray-500
                'gray-1': '#f3f4f6'  // 相當於 gray-100
            }
        }
    },
    plugins: []
};
