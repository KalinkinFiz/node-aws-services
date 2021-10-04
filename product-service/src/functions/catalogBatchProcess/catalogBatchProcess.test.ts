import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { main } from "./handler";

jest.mock("pg", () => ({
  Client: jest.fn(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  })),
}));

let snsPublishMock;
let originalConsoleError = console.error;
let consoleErrorMessage;

describe("catalogBatchProcess", () => {
  beforeAll(async (done) => {
    snsPublishMock = jest.fn();
    AWSMock.setSDKInstance(AWS);
    AWSMock.mock("SNS", "publish", (params, callback) => {
      snsPublishMock(params);
      callback(null, null);
    });
    console.error = (e) => (consoleErrorMessage = e.message);
    done();
  });

  afterAll(() => {
    AWSMock.restore("SNS");
    jest.clearAllMocks();
    console.error = originalConsoleError;
  });

  test("publish message", async () => {
    const eventFixture = {
      Records: [],
    };
    await main(eventFixture, null, null);
    expect(snsPublishMock).toHaveBeenCalled();
  });

  test("logs in case of products were not saved", async () => {
    snsPublishMock.mockImplementation(() => {
      throw new Error("Products were not saved");
    });
    const eventFixture = {
      Records: [],
    };
    await main(eventFixture, null, null);

    expect(consoleErrorMessage).toBe("Products were not saved");
  });
});
