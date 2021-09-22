import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";

const serverlessConfiguration: AWS = {
  service: "import-service",
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
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "s3:ListBucket",
        Resource: `arn:aws:s3:::rss-node-in-aws-s3`,
      },
      {
        Effect: "Allow",
        Action: "s3:*",
        Resource: `arn:aws:s3:::rss-node-in-aws-s3/*`,
      },
    ],
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: { importProductsFile },
};

module.exports = serverlessConfiguration;
