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

    console.log("📝 productId: ", productId);

    try {
      product = await findProductById(productId);
      return formatJSONResponse(product);
    } catch (e) {
      return formatJSONResponse({ data: e.message }, e.statusCode || 500);
    }
  };

export const main = middyfy(getProductsById);
