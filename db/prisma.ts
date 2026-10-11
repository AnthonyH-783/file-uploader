import { Prisma } from "../generated/prisma/browser";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.SUPABASE_DB_URL;
console.log("DB host:", connectionString ? new URL(connectionString).host : "UNDEFINED");
const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

export default prisma;