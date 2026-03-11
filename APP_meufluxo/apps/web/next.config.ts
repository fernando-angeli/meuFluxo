import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@meufluxo/types", "@meufluxo/utils", "@meufluxo/api-client"],
};

export default nextConfig;
