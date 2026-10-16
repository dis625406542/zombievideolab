import "server-only";
import { pool } from "./db";
import type { Resolution } from "./video-provider";
export type Price = { id: string; product_id: string; name: string; description: string; resolution: Resolution; amount_minor: number; currency: "USD"; duration_seconds: number };
export async function catalog(): Promise<Price[]> {
  return (await pool().query<Price>(`SELECT p.id,p.product_id,p.resolution,p.amount_minor,p.currency,p.duration_seconds,g.name,g.description
    FROM zombievideolab_pro.product_prices p JOIN zombievideolab_pro.products g ON g.id=p.product_id
    WHERE p.is_active AND g.is_active ORDER BY g.sort_order,p.amount_minor`)).rows;
}
export async function consumeLimit(scope: string, subject: string, limit: number, seconds=3600) {
  const result = await pool().query(`INSERT INTO zombievideolab_pro.request_limits(scope,subject,window_start)
    VALUES($1,$2,to_timestamp(floor(extract(epoch FROM now())/$3)*$3))
    ON CONFLICT(scope,subject,window_start) DO UPDATE SET count=zombievideolab_pro.request_limits.count+1
    WHERE zombievideolab_pro.request_limits.count<$4 RETURNING count`, [scope,subject,seconds,limit]);
  return result.rowCount === 1;
}
