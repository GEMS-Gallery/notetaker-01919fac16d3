import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dfxJson from './dfx.json';

const isDev = process.env.NODE_ENV !== 'production';

const network = process.env.DFX_NETWORK || (isDev ? 'local' : 'ic');

const canisterIds = (() => {
  let localCanisters, prodCanisters;
  try {
    localCanisters = require(path.resolve('.dfx', 'local', 'canister_ids.json'));
  } catch (error) {
    console.log('No local canister_ids.json found. Continuing production');
  }
  try {
    prodCanisters = require(path.resolve('canister_ids.json'));
  } catch (error) {
    console.log('No production canister_ids.json found. Continuing with local');
  }

  const canisterIds = network === 'local' ? localCanisters : prodCanisters;

  return Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
    acc[name] = { canisterId: canisterIds[name][network] };
    return acc;
  }, {});
})();

const aliases = Object.entries(dfxJson.canisters).reduce((acc, [name, _value]) => {
  acc[name] = path.resolve(__dirname, 'src', 'declarations', name);
  return acc;
}, {});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      ...aliases,
    },
  },
  define: {
    'process.env.DFX_NETWORK': JSON.stringify(network),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    ...Object.entries(canisterIds).reduce((acc, [key, { canisterId }]) => {
      acc[`process.env.${key.toUpperCase()}_CANISTER_ID`] = JSON.stringify(canisterId);
      return acc;
    }, {}),
  },
  build: {
    outDir: 'frontend/dist',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
    },
  },
});
