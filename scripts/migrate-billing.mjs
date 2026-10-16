import nextEnv from '@next/env';
const { loadEnvConfig } = nextEnv;
import pg from 'pg';
import { readFileSync } from 'node:fs';
loadEnvConfig(process.cwd());
const raw = process.env.DIRECT_PRO_URL || process.env.DATABASE_PRO_URL;
if (!raw) throw new Error('DIRECT_PRO_URL or DATABASE_PRO_URL is required');
const url = new URL(raw);
const tls = url.searchParams.get('sslmode') === 'require';
if(tls) { url.searchParams.delete('sslmode'); url.searchParams.delete('uselibpqcompat'); }
const client = new pg.Client({connectionString:url.toString(), ...(tls?{ssl:{rejectUnauthorized:false}}:{}),connectionTimeoutMillis:15000});
try {
 await client.connect();
 await client.query('BEGIN');
 await client.query(readFileSync('src/lib/video-jobs.sql','utf8'));
 await client.query(readFileSync('src/lib/billing.sql','utf8'));
 await client.query('COMMIT');
 console.log('Applied additive migration to schema zombievideolab_pro only.');
 console.table((await client.query('SELECT code,resolution,amount_minor,currency,is_active FROM zombievideolab_pro.product_prices ORDER BY resolution')).rows);
} catch(e) { await client.query('ROLLBACK').catch(()=>{}); console.error(e.message); process.exitCode=1; }
finally { await client.end(); }
