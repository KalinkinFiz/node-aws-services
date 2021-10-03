import "source-map-support/register";

import * as lambda from "aws-lambda";
import { SNS } from "aws-sdk";

import { middyfy } from "@libs/lambda";
import { insertProducts } from "@db/products";

const catalogBatchProcess = async (event: lambda.SQSEvent) => {
  const sns = new SNS();
  const recordsData = event.Records.map((record) => JSON.parse(record.body));

  try {
    await insertProducts(recordsData);
    console.log("📝 catalogBatchProcess records inserted: ", recordsData);
    const highestPrice = Math.max(
      ...recordsData.map(({ price }) => Number(price))
    );

    await sns
      .publish({
        Subject: "Products data uploaded",
        Message: `Uploaded products:\n\n${JSON.stringify(
          recordsData,
          null,
          2
        )}`,
        TopicArn: "CreateProductsTopic",
        MessageAttributes: {
          highestPrice: {
            DataType: "Number",
            StringValue: String(highestPrice),
          },
        },
      })
      .promise();
    console.log(`📝 email was sent with ${recordsData.length} record(s)`);
  } catch (e) {
    console.error(e);
  }
};

export const main = middyfy(catalogBatchProcess);
