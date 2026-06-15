import expressSession, {SessionOptions} from "express-session";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import "dotenv/config";


// Creating adapter and passing it to prisma client
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({connectionString});
const prisma = new PrismaClient({adapter});

// Creating Prisma session store
const store = new PrismaSessionStore(
    prisma,
    {
        checkPeriod: 2 * 60 * 1000, // 2 hours
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    } 
)

// Configuring express session with prisma store
const secret = process.env.SECRET;
if(!secret){
    throw new Error("Could not find secret for session encryption");
}
const config: SessionOptions = {
    store,
    secret, // for cookie signature encryption
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}


const configuredSession = expressSession(config);

export default configuredSession;

