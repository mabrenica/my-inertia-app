import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; // Imports the React compiler plugin

export default defineConfig({
    plugins: [
        laravel({
            input: 'resources/js/app.jsx', // Changes .js to .jsx
            refresh: true,
        }),
        react(), // Activates React compilation support
    ],
});
