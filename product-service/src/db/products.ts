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
        StatusCodes.NOT_FOUND,
        "PRODUCT_NOT_FOUND"
      );
    }
    return product;
  } catch (e) {
    throw e;
  } finally {
    await client.end();
  }
};

export const findAllProducts = async (): Promise<ProductType[]> => {
  const client = new Client(dbOptions);
  let productsList: ProductType[];

  const findAll = sql`
    select p.id, count, price, title, description
    from products p
    join stocks s
    on p.id=s.product_id
  `;

  await client.connect();

  try {
    productsList = (await client.query(findAll)).rows;
    return productsList;
  } catch (e) {
    throw e;
  } finally {
    await client.end();
  }
};

const runInsertTransaction = async (
  db: Client,
  { count, description, price, title }: ProductType
): Promise<ProductType> => {
  try {
    await db.query(sql`begin`);

    const insertProduct = sql`
      insert into products (title, description, price)
      values($1, $2, $3) returning id;
    `;

    const insertStock = sql`
      insert into stocks (product_id, count)
      values($1, $2)
    `;

    const { id } = (await db.query(insertProduct, [title, description, price]))
      .rows[0];

    await db.query(insertStock, [id, count]);
    await db.query(sql`commit`);

    return {
      id,
      count,
      description,
      price,
      title,
    };
  } catch (e) {
    await db.query(sql`rollback`);

    throw new Error(e.message || 500);
  }
};

export const insertProduct = async (
  product: ProductType
): Promise<ProductType> => {
  const db = new Client(dbOptions);
  await db.connect();

  try {
    const createdProduct = await runInsertTransaction(db, product);

    return createdProduct;
  } catch (e) {
    await db.query(sql`rollback`);

    throw new Error(e.message || 500);
  } finally {
    await db.end();
  }
};

export const insertProducts = async (products: ProductType[]) => {
  const db = new Client(dbOptions);
  await db.connect();

  const batchTransactionsResults = await Promise.allSettled(
    products.map(async (product) => {
      try {
        await runInsertTransaction(db, product);
      } catch (e) {
        throw {
          message: e.message,
          product,
        };
      }
    })
  ).catch((e) => e);

  const failedRecordsData = batchTransactionsResults.filter(
    ({ status }) => status === "rejected"
  );

  try {
    if (failedRecordsData.length) {
      throw {
        message: "Some records were not inserted",
        failedRecordsData: failedRecordsData.map((failedRecord) =>
          JSON.stringify(failedRecord.reason)
        ),
      };
    }
  } finally {
    await db.end();
  }
};
