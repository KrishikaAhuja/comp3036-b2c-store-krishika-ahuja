import { PrismaClient } from "@prisma/client"; // imports Prisma client to interact with database
import { env } from "@repo/env/web"; // imports environment variables (like DATABASE_URL)

// extend global object so we can store prisma instance (prevents multiple connections)
declare global {
  var prisma: PrismaClient | undefined;
}

// function to create or reuse Prisma client
export const createClient = () => {

  // if prisma already exists globally, reuse it
  // this avoids creating multiple DB connections (important in dev)
  if (globalThis.prisma) {
    return globalThis.prisma;
  }

  // get database URL from env file
  const URL = env.DATABASE_URL;

  // create new Prisma client
  const prisma = new PrismaClient({
    datasourceUrl: URL, // connect to database using URL
  });

  // store it globally so next time we reuse it
  globalThis.prisma = prisma;

  return prisma; // return the client
};

// export a simple client object
export const client = {
  get db() {
    return createClient(); // whenever we call client.db, it gives Prisma client
  },
};