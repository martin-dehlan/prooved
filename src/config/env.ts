import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

  EBAY_APP_ID: z.string().optional(),
  EBAY_CERT_ID: z.string().optional(),
  EBAY_DEV_ID: z.string().optional(),
  EBAY_REDIRECT_URI: z.string().optional(),
  EBAY_RUNAME: z.string().optional(),

  EBAY_ENV: z.enum(['sandbox', 'live']).default('sandbox'),

  PAYPAL_CLIENT_ID: z.string().optional(),
  PAYPAL_CLIENT_SECRET: z.string().optional(),
  PAYPAL_ENV: z.enum(['sandbox', 'live']).default('sandbox'),

  ENCRYPTION_KEY: z.string().length(64).optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  RESEND_API_KEY: z.string().optional(),

  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(['devnet', 'mainnet-beta']).default('devnet'),
  SOLANA_RPC_URL: z.string().url().default('https://api.devnet.solana.com'),
  PROOVED_SIGNING_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  EBAY_APP_ID: process.env.EBAY_APP_ID,
  EBAY_CERT_ID: process.env.EBAY_CERT_ID,
  EBAY_DEV_ID: process.env.EBAY_DEV_ID,
  EBAY_REDIRECT_URI: process.env.EBAY_REDIRECT_URI,
  EBAY_RUNAME: process.env.EBAY_RUNAME,
  EBAY_ENV: process.env.EBAY_ENV,
  PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
  PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
  PAYPAL_ENV: process.env.PAYPAL_ENV,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
  PROOVED_SIGNING_KEY: process.env.PROOVED_SIGNING_KEY,
});

if (!parsed.success) {
  console.error('Invalid env config:', parsed.error.flatten().fieldErrors);
  throw new Error('Environment variables missing or invalid. See .env.example');
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
