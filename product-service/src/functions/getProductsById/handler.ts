import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { findProductById, ProductType } from "@db/products";

const getProductsById: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (event) => {
    const { productId } = event?.pathParameters || {};
    let product: ProductType;

    try {
      product = findProductById(productId);
      return formatJSONResponse(product);
    } catch (e) {
      return {
        statusCode: e.statusCode,
        body: e.message,
      };
    }
  };

export const main = middyfy(getProductsById);