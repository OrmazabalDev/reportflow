import { APP_BUILD_NUMBER, UPDATE_MANIFEST_URL } from "@/lib/version";
import type { UpdateManifest } from "./update.types";

export const updateService = {
  async fetchUpdateManifest(): Promise<UpdateManifest | null> {
    try {
      const response = await fetch(UPDATE_MANIFEST_URL, {
        cache: "no-store", // Ensure we don't cache an old version
      });
      if (!response.ok) return null;
      return (await response.json()) as UpdateManifest;
    } catch (error) {
      console.warn("Could not fetch update manifest", error);
      return null;
    }
  },

  async checkForUpdate(): Promise<UpdateManifest | null> {
    const manifest = await this.fetchUpdateManifest();
    if (!manifest) return null;

    const currentBuild = parseInt(APP_BUILD_NUMBER, 10);
    if (manifest.latestBuild > currentBuild) {
      return manifest;
    }
    return null;
  },
};
