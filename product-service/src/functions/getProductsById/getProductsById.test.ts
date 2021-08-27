import { mocked } from "ts-jest/utils";
import { Handler } from "aws-lambda";

import { middyfy } from "@libs/lambda";
import { products } from "@db/products";

jest.mock("@libs/lambda");

describe("getProductsById handler", () => {
  let main;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;

  beforeEach(async () => {
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });

    main = (await import("./handler")).main;
  });

  it("product retrieval", async () => {
    const product = products[Math.floor(Math.random() * products.length)];
    const event = {
      pathParameters: { productId: product.id },
    } as any;
    const actual = await main(event);
    const body = JSON.parse(actual.body);
    expect(body).toEqual(product);
  });

  it("product not found", async () => {
    const event = {
      pathParameters: { productId: "something" },
    } as any;
    const actual = await main(event);
    expect(actual.body).toEqual("Product not found");
  });
});
