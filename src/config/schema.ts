import { z } from 'zod';

export const repositorySchema = z.object({
  owner: z.string().min(1),
  name: z.string().min(1),
  fullName: z.string().min(1),
  lastAccessed: z.string().datetime(),
});

export const configProfileSchema = z.object({
  name: z.string().min(1),
  favoriteRepositories: z.array(repositorySchema),
  recentRepositories: z.array(repositorySchema),
});

export const configSchema = z
  .object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in semver format'),
    activeProfile: z.string().min(1),
    profiles: z.record(z.string(), configProfileSchema),
  })
  .refine(
    data => data.profiles[data.activeProfile] !== undefined,
    'Active profile must exist in profiles'
  );

// Types inferred from the schemas
export type RepositorySchema = z.infer<typeof repositorySchema>;
export type ConfigProfileSchema = z.infer<typeof configProfileSchema>;
export type ConfigSchema = z.infer<typeof configSchema>;

// Schema version migrations
export const migrations = new Map<string, (config: unknown) => unknown>([
  ['1.0.0', config => config], // Initial version, no migration needed
]);

export function validateConfig(config: unknown): ConfigSchema {
  return configSchema.parse(config);
}

export function migrateConfig(config: unknown): unknown {
  const currentVersion = (config as { version?: string })?.version ?? '0.0.0';
  const versions = Array.from(migrations.keys()).sort();

  let migratedConfig = config;
  for (const version of versions) {
    if (version > currentVersion) {
      const migration = migrations.get(version);
      if (migration) {
        migratedConfig = migration(migratedConfig);
      }
    }
  }

  return migratedConfig;
}
