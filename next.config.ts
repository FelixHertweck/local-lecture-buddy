import process from "process";

const nextConfig = () => {
  const buildMode = process.env.BUILD_MODE;

  if (buildMode === "static") {
    return {
      output: "export",
      basePath: process.env.PAGES_BASE_PATH,
      assetPrefix: process.env.PAGES_BASE_PATH,
    };
  }

  if (buildMode === "standalone") {
    return {
      output: "standalone",
    };
  }
  return {};
};

export default nextConfig;
