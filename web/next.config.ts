import type { NextConfig } from "next";

const config: NextConfig = {
  env: {
    PERISAI_API: process.env.PERISAI_API ?? "http://localhost:8088",
  },
};

export default config;
