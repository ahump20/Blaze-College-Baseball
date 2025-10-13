import { register } from 'ts-node';
register({
  transpileOnly: true,
  compilerOptions: {
    module: 'commonjs',
    moduleResolution: 'node',
    esModuleInterop: true,
    target: 'ES2022',
  },
});

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/playwright',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
});
