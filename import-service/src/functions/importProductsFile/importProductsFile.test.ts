import * as AWSMock from "aws-sdk-mock";
import * as AWS from "aws-sdk";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import { main } from "./handler";

describe("importProductsFile", () => {
  beforeAll(() => {
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("S3", "getSignedUrl", (_, { Key }, cb) => {
      const signedUrl = `https://aws-s3-url/${Key}`;
      cb(null, signedUrl);
    });
  });

  afterAll(() => {
    AWSMock.restore("S3");
  });

  it("correct upload destination", async () => {
    const fileName = "file.csv";
    const event = {
      queryStringParameters: { name: fileName },
    } as unknown as APIGatewayProxyEvent;

    const expectedKey = `uploaded/${fileName}`;
    const lambdaResponse: APIGatewayProxyResult = {
      body: `https://aws-s3-url/${expectedKey}`,
      statusCode: 200,
    };
    const res = (await main(event, null, null)) as APIGatewayProxyResult;

    expect(res.body).toBe(lambdaResponse.body);
  });
});
