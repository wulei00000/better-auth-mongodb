import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);
const database = client.db(process.env.MONGODB_DB || "better-auth");

export const auth = betterAuth({
    database: mongodbAdapter(database),
    emailAndPassword: {
        enabled: true, 
    },
    socialProviders: {
        github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
        },
    },
    secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-for-development",
});