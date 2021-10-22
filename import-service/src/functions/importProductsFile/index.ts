import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: "get",
        path: "import",
        authorizer: {
          name: "tokenAuthorizer",
          arn: "arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:authorization-service-dev-basicAuthorizer",
          resultTtlInSeconds: 0,
          identitySource: "method.request.header.Authorization",
          type: "token",
        },
        request: {
          parameters: {
            querystrings: {
              name: true,
            },
          },
        },
      },
    },
  ],
};
