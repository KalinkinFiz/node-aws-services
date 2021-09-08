import { StatusCodes } from "http-status-codes";
import { Client, ClientConfig } from "pg";

import AppError from "./AppError";

export type ProductType = {
  count: number;
  description: string;
  id: string;
  price: number;
  title: string;
};

const { PG_HOST, PG_USER, PG_DB, PG_PASSWORD, PG_PORT } = process.env;

const dbOptions: ClientConfig = {
  host: PG_HOST,
  port: Number(PG_PORT),
  database: PG_DB,
  user: PG_USER,
  password: PG_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

// export const products = [
//   {
//     count: 4,
//     description: "Short Product Description1",
//     id: "7567ec4b-b10c-48c5-9345-fc73c48a80aa",
//     price: 2.4,
//     title: "ProductOne",
//   },
//   {
//     count: 6,
//     description: "Short Product Description3",
//     id: "7567ec4b-b10c-48c5-9345-fc73c48a80a0",
//     price: 10,
//     title: "ProductNew",
//   },
//   {
//     count: 7,
//     description: "Short Product Description2",
//     id: "7567ec4b-b10c-48c5-9345-fc73c48a80a2",
//     price: 23,
//     title: "ProductTop",
//   },
//   {
//     count: 12,
//     description: "Short Product Description7",
//     id: "7567ec4b-b10c-48c5-9345-fc73c48a80a1",
//     price: 15,
//     title: "ProductTitle",
//   },
//   {
//     count: 7,
//     description: "Short Product Description2",
//     id: "7567ec4b-b10c-48c5-9345-fc73c48a80a3",
//     price: 23,
//     title: "Product",
//   },
//   {
//     count: 8,
//     description: "Short Product Description4",
//     id: "7567ec4b-b10c-48c5-9345-fc73348a80a1",
//     price: 15,
//     title: "ProductTest",
//   },
//   {
//     count: 2,
//     description: "Short Product Descriptio1",
//     id: "7567ec4b-b10c-48c5-9445-fc73c48a80a2",
//     price: 23,
//     title: "Product2",
//   },
//   {
//     count: 3,
//     description: "Short Product Description7",
//     id: "7567ec4b-b10c-45c5-9345-fc73c48a80a1",
//     price: 15,
//     title: "ProductName",
//   },
// ];

const sql = (strings: TemplateStringsArray, ...values: any[]): string =>
  String.raw(strings, ...values);

export const findProductById = async (
  productId: string
): Promise<ProductType> | null => {
  const client = new Client(dbOptions);
  let product: ProductType;

  const findById = sql`
    select p.id, count, title, description, price
    from products p
    join stocks s
    on p.id=s.product_id 
    where p.id=$1
  `;

  await client.connect();

  try {
    product = (await client.query(findById, [productId])).rows[0];

    if (!product) {
      throw new AppError(
        "Product not found",
        StatusCodes.BAD_REQUEST,
        "PRODUCT_NOT_FOUND"
      );
    }
    return product;
  } catch (e) {
    throw new Error(e.message);
  } finally {
    await client.end();
  }
};
