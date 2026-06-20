export interface UpdateManifest {
  appName: string;
  latestVersion: string;
  latestBuild: number;
  stage: string;
  apkUrl: string;
  releaseNotes: string[];
  required: boolean;
  publishedAt?: string;
}
