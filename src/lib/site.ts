const fallbackOwner = "ZZZZZXX";
const fallbackRepo = "pc-builder";

const owner = process.env.GITHUB_REPOSITORY?.split("/")[0] ?? fallbackOwner;
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? fallbackRepo;

export const sitePath = repoName && !repoName.endsWith(".github.io") ? `/${repoName}` : "";

const explicitSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");
export const siteUrl = explicitSiteUrl || `https://${owner.toLowerCase()}.github.io${sitePath}`;

export const siteName = "PC Builder";
export const siteTitle = "PC Builder — Система подбора конфигурации ПК";
export const siteDescription =
  "Система подбора конфигурации персонального компьютера с проверкой совместимости и сравнением цен";
export const googleSiteVerification = "googlee174b10c73ff7c66.html";

export const defaultKeywords = [
  "PC 装机",
  "DIY 装机",
  "电脑主机配件",
  "主机配件比价",
  "PC builder",
  "PC parts price comparison",
  "CPU",
  "GPU",
  "主板",
  "显卡价格",
];
