import "source-map-support/register";

import * as AWS from "aws-sdk";

import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

const importProductsFile = async (event) => {
  const name = decodeURIComponent(event.queryStringParameters?.name);
  const s3 = new AWS.S3({ region: "eu-west-1" });
  const params = {
    Bucket: "rss-node-in-aws-s3",
    Key: `uploaded/${name}`,
    Expires: 60,
    ContentType: "text/csv",
  };
  const signedUrl = await s3.getSignedUrlPromise("putObject", params);

  return formatJSONResponse({
    statusCode: 200,
    body: signedUrl,
  });
};

export const main = middyfy(importProductsFile);
