export interface Repository {
  owner: string;
  name: string;
  fullName: string;
  lastAccessed: string;
}

export interface ConfigProfile {
  name: string;
  favoriteRepositories: Repository[];
  recentRepositories: Repository[];
}

export interface Config {
  activeProfile: string;
  profiles: Record<string, ConfigProfile>;
  version: string;
}

export type ConfigKey = keyof Config;
export type ProfileKey = keyof ConfigProfile;
