import defaultTheme from "tailwindcss/defaultTheme";
import forms from "@tailwindcss/forms";
import colors from "tailwindcss/colors";

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/js/**/*.jsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },

            colors: {
                // 'primary' adalah warna tema utama (Tombol, Icon aktif, Label)
                // Saat ini kita pakai 'primary-600'. Kalau mau ganti biru, ubah jadi 'colors.blue'
                primary: colors.emerald,

                // 'dark' adalah warna Sidebar dan Background gelap
                // Saat ini kita pakai 'slate'.
                dark: colors.slate,
            },
        },
    },

    plugins: [forms],
};
