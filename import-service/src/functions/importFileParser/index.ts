import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      s3: {
        bucket: "rss-node-in-aws-s3",
        event: "s3:ObjectCreated:*",
        rules: [
          {
            prefix: "uploaded/",
            suffix: ".csv",
          },
        ],
        existing: true,
      },
    },
  ],
};
