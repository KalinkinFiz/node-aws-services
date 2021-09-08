export default {
  type: "object",
  properties: {
    count: {
      type: "number",
    },
    description: {
      type: "string",
    },
    price: {
      type: "number",
    },
    title: {
      type: "string",
    },
  },
  required: ["title"],
} as const;
