import domdomeggConfig from 'eslint-config-domdomegg';
import nextConfig from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const conflictingPlugins = new Set(['jsx-a11y', 'react', 'react-hooks', '@typescript-eslint']);

// Strip plugins from domdomegg that are also defined by next config to avoid redefinition errors
const domdomeggFiltered = domdomeggConfig.map((config) => {
  if (!config.plugins) return config;
  const hasConflict = Object.keys(config.plugins).some((p) => conflictingPlugins.has(p));
  if (!hasConflict) return config;
  const filteredPlugins = Object.fromEntries(
    Object.entries(config.plugins).filter(([key]) => !conflictingPlugins.has(key)),
  );
  const { plugins, ...rest } = config;
  if (Object.keys(filteredPlugins).length > 0) {
    return { ...rest, plugins: filteredPlugins };
  }
  return rest;
});

export default [
  ...domdomeggFiltered,
  ...nextConfig,
  ...nextTypescript,
];
