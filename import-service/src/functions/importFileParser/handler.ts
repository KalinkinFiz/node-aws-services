import "source-map-support/register";

import { S3Event, S3Handler } from "aws-lambda";
import { middyfy } from "@libs/lambda";
import cors from "@middy/http-cors";
import * as AWS from "aws-sdk";
import csv from "csv-parser";
import { Transform } from "stream";
import { SQS } from "aws-sdk";

const SOURCE_FOLDER = "uploaded";
const TARGET_FOLDER = "parsed";

const sendRecordsToQueue = (
  s3: AWS.S3,
  source: string,
  sqs: AWS.SQS
): Promise<Transform> => {
  const csvReadStream = s3
    .getObject({
      Bucket: "rss-node-in-aws-s3",
      Key: source,
    })
    .createReadStream();

  const transformRecordsStream = csvReadStream.pipe(csv());

  transformRecordsStream.on("data", (parsedRecord) => {
    console.log(parsedRecord);
    sqs.sendMessage(
      {
        MessageBody: JSON.stringify(parsedRecord),
        QueueUrl: "product-service-dev-CatalogItemsQueueUrl",
      },
      (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(data);
      }
    );
  });

  return new Promise(
    (resolve, reject): Transform =>
      transformRecordsStream.on("error", reject).on("end", resolve)
  );
};

const copyCsvFile = (s3: AWS.S3, source: string) => {
  return s3
    .copyObject({
      Bucket: "rss-node-in-aws-s3",
      CopySource: `rss-node-in-aws-s3/${source}`,
      Key: source.replace(SOURCE_FOLDER, TARGET_FOLDER),
    })
    .promise();
};

const deleteCsvFile = (s3: AWS.S3, source: string) => {
  return s3
    .deleteObject({
      Bucket: "rss-node-in-aws-s3",
      Key: source,
    })
    .promise();
};

const importFileParser: S3Handler = async (event: S3Event): Promise<void> => {
  const s3 = new AWS.S3({ region: "eu-west-1" });
  const sqs = new SQS();

  for (const record of event.Records) {
    const source = decodeURIComponent(record.s3.object.key.replace(/\+/g, " "));
    const fileName = source.replace(`${SOURCE_FOLDER}/`, "");

    await sendRecordsToQueue(s3, source, sqs);
    await copyCsvFile(s3, source);
    await deleteCsvFile(s3, source);

    console.log(
      `File ${fileName} was moved from /${SOURCE_FOLDER} to /${TARGET_FOLDER}`
    );
  }
};

export const main = middyfy(importFileParser).use(cors());
