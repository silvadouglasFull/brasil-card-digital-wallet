import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z
    .string()
    .refine(
      (port) => parseInt(port) > 0 && parseInt(port) < 65536,
      "Invalid port number",
    ),
  DATABASE_URL: z
    .string()
    .refine((url) => url.startsWith("postgres"), "Invalid URL format"),
  JWT_SECRET: z.string(),
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);
