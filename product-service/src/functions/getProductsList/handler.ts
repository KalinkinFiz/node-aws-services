import "source-map-support/register";

import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";

import schema from "./schema";
import { products } from "../../db/products";

const getProductsList: ValidatedEventAPIGatewayProxyEvent<typeof schema> =
  async (_event) => formatJSONResponse(products);

export const main = middyfy(getProductsList);
