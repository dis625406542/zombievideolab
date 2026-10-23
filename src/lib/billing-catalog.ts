import "server-only";
import { pool } from "./db";
import type { Resolution } from "./video-provider";
import { DEFAULT_TEMPLATE, videoTemplate, type TemplateId } from "./video-templates";
import { stripeConfigured, stripeEnvironment } from "./stripe";
export type Price = { id: string; product_id: string; name: string; description: string; resolution: Resolution; amount_minor: number; currency: "USD"; duration_seconds: number; purchasable: boolean };
export async function catalog(templateId: TemplateId = DEFAULT_TEMPLATE): Promise<Price[]> {
  return (await pool().query<Price>(`SELECT p.id,p.product_id,p.resolution,p.amount_minor,p.currency,p.duration_seconds,g.name,g.description,
    (p.duration_seconds=$3 AND EXISTS(SELECT 1 FROM zombievideolab_pro.stripe_price_mappings m WHERE m.price_id=p.id AND m.environment=$2)) AS purchasable
    FROM zombievideolab_pro.product_prices p JOIN zombievideolab_pro.products g ON g.id=p.product_id
    WHERE p.is_active AND g.is_active AND p.product_id=$1 ORDER BY p.amount_minor`,
    [videoTemplate(templateId).productId, stripeConfigured() ? stripeEnvironment() : "unconfigured",videoTemplate(templateId).durationSeconds])).rows;
}
export async function consumeLimit(scope: string, subject: string, limit: number, seconds=3600) {
  const result = await pool().query(`INSERT INTO zombievideolab_pro.request_limits(scope,subject,window_start)
    VALUES($1,$2,to_timestamp(floor(extract(epoch FROM now())/$3)*$3))
    ON CONFLICT(scope,subject,window_start) DO UPDATE SET count=zombievideolab_pro.request_limits.count+1
    WHERE zombievideolab_pro.request_limits.count<$4 RETURNING count`, [scope,subject,seconds,limit]);
  return result.rowCount === 1;
}
