import { mocked } from "ts-jest/utils";
import { Handler } from "aws-lambda";

import { middyfy } from "@libs/lambda";

jest.mock("@libs/lambda");

describe("getProductsList handler", () => {
  let main;
  let mockedMiddyfy: jest.MockedFunction<typeof middyfy>;

  beforeEach(async () => {
    mockedMiddyfy = mocked(middyfy);
    mockedMiddyfy.mockImplementation((handler: Handler) => {
      return handler as never;
    });

    main = (await import("./handler")).main;
  });

  afterEach(() => {
    jest.resetModules();
  });

  it("list of products", async () => {
    const event = {
      body: {},
    } as any;
    const actual = await main(event);
    expect(actual).toBeInstanceOf(Object);
  });
});
