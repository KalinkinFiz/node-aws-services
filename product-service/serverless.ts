import type { AWS } from "@serverless/typescript";
import dotenv from "dotenv";

import getProductsList from "@functions/getProductsList";
import getProductsById from "@functions/getProductsById";
import postProducts from "@functions/postProducts";

dotenv.config();

const { PG_USER, PG_HOST, PG_DB, PG_PASSWORD, PG_PORT } = process.env;

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "2",
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ["serverless-webpack", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "eu-west-1",
    stage: "dev",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      PG_USER,
      PG_HOST,
      PG_DB,
      PG_PASSWORD,
      PG_PORT,
    },
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: { getProductsList, getProductsById, postProducts },
  useDotenv: true,
};

module.exports = serverlessConfiguration;
