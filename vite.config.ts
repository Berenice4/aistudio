import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Questo rende la variabile d'ambiente disponibile al codice lato client.
    // Vite sostituirà `process.env.API_KEY` con il valore effettivo durante la build.
    // Questo valore viene preso dall'ambiente di build (ad es. le variabili d'ambiente di Netlify).
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY)
  }
});
