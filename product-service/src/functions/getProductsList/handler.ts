import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { findAllProducts } from "@db/products";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (_event) => {
    let result;

    try {
      result = await findAllProducts();

      return formatJSONResponse(result);
    } catch (e) {
      return formatJSONResponse({ data: e.message }, e.statusCode || 500);
    }
  };

export const main = middyfy(getProductsList);
