import { config } from "./config";

export function getApkDownloadUrl(): string {
  return `${config.android.apkDownloadUrl}?v=${Date.now()}`;
}
