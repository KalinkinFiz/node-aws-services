import { APIGatewayProxyResult } from "aws-lambda";
import * as AWSMock from "aws-sdk-mock";
import { main } from "./handler";

describe("importProductsFile", () => {
  test("should return correct signed url", async () => {
    const eventMock = { queryStringParameters: { name: "file.csv" } } as any;
    const signedUrlMock = "signed-url-mock";

    AWSMock.mock("S3", "getSignedUrl", (_, __, callback) => {
      callback(null, signedUrlMock);
    });

    const result = (await main(eventMock, null, null)) as APIGatewayProxyResult;

    expect(result.statusCode).toEqual(200);
    expect(result.body).toEqual(JSON.stringify({ signedUrl: signedUrlMock }));
    AWSMock.restore("S3");
  });
});
