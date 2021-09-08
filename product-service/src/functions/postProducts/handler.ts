import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { insertProduct, ProductType } from "@db/products";
import AppError from "@db/AppError";
import { StatusCodes } from "http-status-codes";

type SchemaType = {
  [key: string]: (value: any) => boolean;
};

const findInvalidFields = (object, schema: SchemaType) => {
  return Object.entries(schema)
    .filter(([key, isValid]) => !isValid(object[key]))
    .map(([key]) => key);
};

const canBeEmpty = (value) => [undefined, null].includes(value);

const productSchema: SchemaType = {
  title: (value) => value && typeof value === "string",
  description: (value) => typeof value === "string" || canBeEmpty(value),
  price: (value) => !!Number(value) || canBeEmpty(value),
  count: (value) => Number.isInteger(Number(value)) || canBeEmpty(value),
};

const postProducts: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const data = event.body as unknown as ProductType;

  console.log("📝 createProducts: ", data);

  try {
    const invalidFields = findInvalidFields(data, productSchema);

    if (invalidFields.length) {
      console.log("📝 invalid fields: ", findInvalidFields);

      throw new AppError(
        "Product data is invalid",
        StatusCodes.BAD_REQUEST,
        "BAD_REQUEST"
      );
    }

    const createProduct = await insertProduct(data);

    return formatJSONResponse(createProduct);
  } catch (e) {
    return formatJSONResponse({ data: e.message }, e.statusCode || 500);
  }
};

export const main = middyfy(postProducts);
