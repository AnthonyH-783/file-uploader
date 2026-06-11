import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
// Adapter sends the generated sql to the postgres server over TCP
const adapter = new PrismaPg({ connectionString });
// Prisma client builds query, converts to sql, and passes it to adapter
const prisma = new PrismaClient({ adapter });

export { prisma };