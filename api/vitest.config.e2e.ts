import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // As suítes compartilham o mesmo banco; em paralelo, uma limparia os dados da outra.
    fileParallelism: false,
  },
});
