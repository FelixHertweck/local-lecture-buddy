import process from "process";
import type { NextConfig } from "next";

const nextConfig = (): NextConfig => {
  const buildMode = process.env.BUILD_MODE;
  const basePath = process.env.BASE_PATH || "";

  const config: NextConfig = {
    basePath,
  };

  if (buildMode === "static") {
    config.output = "export";
  }

  if (buildMode === "standalone") {
    config.output = "standalone";
  }

  return config;
};

export default nextConfig;
