import type { AWS } from "@serverless/typescript";
import dotenv from "dotenv";

import getProductsList from "@functions/getProductsList";
import getProductsById from "@functions/getProductsById";
import postProducts from "@functions/postProducts";
import catalogBatchProcess from "@functions/catalogBatchProcess";

dotenv.config();

const {
  PG_USER,
  PG_HOST,
  PG_DB,
  PG_PASSWORD,
  PG_PORT,
  PRODUCTS_SUBSCRIPTION_EMAIL,
  EXPENSIVE_PRODUCTS_SUBSCRIPTION_EMAIL,
} = process.env;

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
      PRODUCTS_SUBSCRIPTION_EMAIL,
      EXPENSIVE_PRODUCTS_SUBSCRIPTION_EMAIL,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: "sqs:ReceiveMessage",
        Resource: {
          "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
        },
      },
      {
        Effect: "Allow",
        Action: "sns:Publish",
        Resource: {
          Ref: "CreateProductsTopic",
        },
      },
    ],
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: {
    getProductsList,
    getProductsById,
    postProducts,
    catalogBatchProcess,
  },
  useDotenv: true,
  resources: {
    Resources: {
      CatalogItemsQueue: {
        Type: "AWS::SQS::Queue",
        Properties: {
          QueueName: "catalogItemsQueue",
        },
      },
      CreateProductsTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "createProductsTopic",
        },
      },
      CreateProductTopicSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          Endpoint: PRODUCTS_SUBSCRIPTION_EMAIL,
          TopicArn: {
            Ref: "CreateProductsTopic",
          },
        },
      },
      CreateExpensiveProductTopicSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Protocol: "email",
          Endpoint: EXPENSIVE_PRODUCTS_SUBSCRIPTION_EMAIL,
          TopicArn: {
            Ref: "CreateProductsTopic",
          },
          FilterPolicy: {
            highestPrice: [
              {
                numeric: [">=", 100],
              },
            ],
          },
        },
      },
    },
    Outputs: {
      QueueURL: {
        Value: {
          Ref: "CatalogItemsQueue",
        },
        Export: {
          Name: {
            "Fn::Sub": "${AWS::StackName}-CatalogItemsQueueUrl",
          },
        },
      },
      QueueARN: {
        Value: {
          "Fn::GetAtt": ["CatalogItemsQueue", "Arn"],
        },
        Export: {
          Name: {
            "Fn::Sub": "${AWS::StackName}-CatalogItemsQueueArn",
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
