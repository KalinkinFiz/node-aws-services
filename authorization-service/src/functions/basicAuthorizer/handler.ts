import {
  APIGatewayAuthorizerHandler,
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerEvent,
} from "aws-lambda";
import "source-map-support/register";

import { middyfy } from "@libs/lambda";

const getCredsFromToken = (token: string) => {
  const encodedCreds = token.split(" ").pop();
  const [username, password] = Buffer.from(encodedCreds, "base64")
    .toString("utf-8")
    .split(":");
  return {
    username,
    password,
  };
};

const getResourceEffect = (authorizationToken: string): "Allow" | "Deny" => {
  const { username, password } = getCredsFromToken(authorizationToken);

  console.log(`username: ${username} password: ${password}`);

  const storedUserPassword = process.env[username];

  return storedUserPassword && storedUserPassword === password
    ? "Allow"
    : "Deny";
};

const generatePolicy = (
  authorizationToken: string,
  resourceArn: string
): APIGatewayAuthorizerResult => {
  const principalId = authorizationToken.replace(/.+\s/, "");
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: getResourceEffect(authorizationToken),
          Resource: resourceArn,
        },
      ],
    },
  };
};

const basicAuthorizer: APIGatewayAuthorizerHandler = async (
  event: APIGatewayTokenAuthorizerEvent,
  _context
) => {
  if (event.type !== "TOKEN") {
    throw new Error("Unauthorized");
  }

  try {
    const { authorizationToken, methodArn } = event;
    const policy = generatePolicy(authorizationToken, methodArn);
    return policy;
  } catch (e) {
    throw new Error(`Unauthorized: ${e.message}`);
  }
};

export const main = middyfy(basicAuthorizer);
