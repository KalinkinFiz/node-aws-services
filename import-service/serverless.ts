import type { AWS } from "@serverless/typescript";

import importProductsFile from "@functions/importProductsFile";
import importFileParser from "@functions/importFileParser";

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
      CATALOG_ITEMS_QUEUE_URL: {
        "Fn::ImportValue": "product-service-dev-CatalogItemsQueueUrl",
      },
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
      {
        Effect: "Allow",
        Action: "sqs:SendMessage",
        Resource: {
          "Fn::ImportValue": "product-service-dev-CatalogItemsQueueArn",
        },
      },
    ],
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: { importProductsFile, importFileParser },
  resources: {
    Resources: {
      UploadBucket: {
        Type: "AWS::S3::Bucket",
        Properties: {
          BucketName: "rss-node-in-aws-s3",
          CorsConfiguration: {
            CorsRules: [
              {
                AllowedOrigins: ["*"],
                AllowedHeaders: ["*"],
                AllowedMethods: ["PUT"],
              },
            ],
          },
        },
      },
      UploadBucketPolicy: {
        Type: "AWS::S3::BucketPolicy",
        Properties: {
          Bucket: "rss-node-in-aws-s3",
          PolicyDocument: {
            Statement: [
              {
                Action: "s3:*",
                Effect: "Allow",
                Resource: `arn:aws:s3:::rss-node-in-aws-s3/*`,
                Principal: {
                  AWS: "*",
                },
              },
            ],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
