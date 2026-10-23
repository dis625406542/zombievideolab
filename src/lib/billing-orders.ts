import "server-only";
import { localMockPayments } from "./local-mock-payments";

import { randomBytes } from "node:crypto";

import type Stripe from "stripe";

import type { PoolClient } from "pg";

import { pool } from "./db";

import type { Price } from "./billing-catalog";

import { stripeClient, stripeEnvironment } from "./stripe";

import { matchesPaidSession, matchesStripePrice } from "./billing-validation";

import { putInputPhoto, deleteInputPhotos, type InputPhoto } from "./r2";

import { selectedProvider, type Resolution, type AspectRatio, type ProviderName } from "./video-provider";



import type { PromptScenario } from "./video-prompt";

import { loadPromptSnapshot } from "./prompt-catalog";
import { requiredPhotoCount, type SceneId, DEFAULT_TEMPLATE, videoSpec, videoTemplate, type TemplateId } from "./video-templates";

export type Order = { template_id:TemplateId; prompt_version:string; scene_id:SceneId; prompt_snapshot:string|null; id:string; code:string; visitor_hash:string; product_name:string; amount_minor:number; currency:string;

 resolution:Resolution; aspect_ratio:AspectRatio; video_provider:ProviderName; provider:string; environment:"test"|"live";

 status:string; generation_status:string; provider_payment_id:string|null; input_photos:InputPhoto[]; input_expires_at:Date; prompt_scenario:PromptScenario|null;

 stripe_product_id:string|null; stripe_price_id:string|null; attempts:number; error:string|null; created_at:Date; paid_at:Date|null };

export const randomId = () => randomBytes(16).toString("hex").toUpperCase();

export async function orderFor(visitor:string, code:string) {

  return (await pool().query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE visitor_hash=$1 AND code=$2",[visitor,code])).rows[0] ?? null;

}

export async function orderById(id:string) {

  return (await pool().query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE id=$1",[id])).rows[0] ?? null;

}

export function publicOrder(order:Order) {

  return {code:order.code,sceneId:order.scene_id,templateId:order.template_id,durationSeconds:videoSpec({templateId:order.template_id,promptVersion:order.prompt_version}).durationSeconds,status:order.status,generationStatus:order.generation_status,resolution:order.resolution,aspectRatio:order.aspect_ratio,

    amountMinor:order.amount_minor,currency:order.currency,attempts:order.attempts,error:order.error,createdAt:order.created_at.toISOString(),

    canRetry:order.status==="paid" && order.generation_status==="failed" && order.attempts<3 && new Date(order.input_expires_at).getTime()>Date.now()};

}

export async function ordersFor(visitor:string,templateId:TemplateId=DEFAULT_TEMPLATE) {

  return (await pool().query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE visitor_hash=$1 AND template_id=$2 ORDER BY created_at DESC LIMIT 50",[visitor,templateId])).rows;

}

export async function createOrder(visitor:string,code:string,resolution:Resolution,aspect:AspectRatio,templateId:TemplateId=DEFAULT_TEMPLATE,mockRequest?:Request,sceneId:SceneId="two-person") {

  requiredPhotoCount(templateId,sceneId);
  const mockPayment=!!mockRequest && localMockPayments(mockRequest,templateId);
  const db=await pool().connect();

  try {

    await db.query("BEGIN");

    await db.query("SELECT pg_advisory_xact_lock(hashtext('zvl-order'),hashtext($1))",[code]);

    const previous=(await db.query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE code=$1",[code])).rows[0];

    if(previous) {

      if(previous.visitor_hash!==visitor || previous.template_id!==templateId || previous.scene_id!==sceneId || previous.resolution!==resolution || previous.aspect_ratio!==aspect || (previous.provider==="local_mock")!==mockPayment) throw new Error("This video code is unavailable. Generate a new code.");

      await db.query("COMMIT"); return {order:previous,created:false};

    }

    if((await db.query("SELECT code FROM zombievideolab_pro.video_jobs WHERE code=$1",[code])).rowCount) throw new Error("This code belongs to an earlier video. Generate a new code.");

    const price=(await db.query<Price>(`SELECT p.*,g.name,g.description FROM zombievideolab_pro.product_prices p

      JOIN zombievideolab_pro.products g ON g.id=p.product_id WHERE p.resolution=$1 AND p.product_id=$2 AND p.is_active AND g.is_active FOR SHARE OF p,g`,[resolution,videoTemplate(templateId).productId])).rows[0];

    if(!price) throw new Error("This video option is no longer available.");

    if(price.duration_seconds!==videoTemplate(templateId).durationSeconds) throw new Error("This video option is temporarily unavailable. Contact support to update its duration.");

    const environment=mockPayment ? "test" : stripeEnvironment();
    const mapping=mockPayment ? null : (await db.query<{stripe_product_id:string;stripe_price_id:string}>(
      `SELECT stripe_product_id,stripe_price_id FROM zombievideolab_pro.stripe_price_mappings
       WHERE price_id=$1 AND environment=$2 FOR SHARE`,[price.id,environment])).rows[0];
    if(!mockPayment && !mapping) throw new Error("This video option is not configured for payment yet. Please try later.");

    const id=randomId();

    const prompt = templateId === DEFAULT_TEMPLATE
      ? {promptVersion:videoTemplate(templateId).promptVersion,promptSnapshot:null}
      : await loadPromptSnapshot(db,templateId,sceneId);
    const result=await db.query<Order>(`INSERT INTO zombievideolab_pro.billing_orders

      (id,code,visitor_hash,product_id,price_id,product_name,amount_minor,currency,resolution,aspect_ratio,video_provider,environment,stripe_product_id,stripe_price_id,template_id,prompt_version,provider,scene_id,prompt_snapshot,input_expires_at)

      VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,now()+interval '3 days') RETURNING *`,

      [id,code,visitor,price.product_id,price.id,price.name,price.amount_minor,price.currency,resolution,aspect,selectedProvider(),environment,mapping?.stripe_product_id ?? null,mapping?.stripe_price_id ?? null,templateId,prompt.promptVersion,mockPayment?"local_mock":"stripe",sceneId,prompt.promptSnapshot]);

    await db.query(`INSERT INTO zombievideolab_pro.billing_checkouts(id,order_id,environment,provider,expires_at) VALUES($1,$2,$3,$4,now()+interval '1 hour')`,[randomId(),id,environment,mockPayment?"local_mock":"stripe"]);

    await db.query("COMMIT"); return {order:result.rows[0],created:true};

  } catch(e) { await db.query("ROLLBACK"); throw e; } finally { db.release(); }

}

export async function completeLocalMockPayment(request:Request,order:Order) {
  if(!localMockPayments(request,order.template_id) || order.provider!=="local_mock" || order.environment!=="test" || order.stripe_price_id || order.stripe_product_id)
    throw new Error("This order cannot use simulated checkout. Create a new video code.");
  const db=await pool().connect();
  try {
    await db.query("BEGIN");
    const updated=(await db.query<Order>(`UPDATE zombievideolab_pro.billing_orders
      SET status='paid',generation_status=CASE WHEN status='pending' THEN 'ready' ELSE generation_status END,
          provider_payment_id=COALESCE(provider_payment_id,$2),paid_at=COALESCE(paid_at,now()),updated_at=now()
      WHERE id=$1 AND provider='local_mock' AND environment='test' AND status IN ('pending','paid')
        AND jsonb_array_length(input_photos)=CASE WHEN template_id='tiptoeing-in-my-jordans' AND scene_id='dancer-only' THEN 1 ELSE 2 END AND input_expires_at>now() RETURNING *`,[order.id,`local_mock_${order.id}`])).rows[0];
    if(!updated) throw new Error("This order cannot complete simulated checkout. Create a new video code.");
    await db.query("UPDATE zombievideolab_pro.billing_checkouts SET status='complete',updated_at=now() WHERE order_id=$1 AND provider='local_mock'",[order.id]);
    await db.query("COMMIT");
    return updated;
  } catch(error) {await db.query("ROLLBACK");throw error;} finally {db.release();}
}

export async function saveOrderPhotos(order:Order,files:File[],scenario:PromptScenario) {

  if(files.length!==requiredPhotoCount(order.template_id,order.scene_id)) throw new Error("Upload the required photos for this scene.");
  const photos:InputPhoto[]=[];

  try {
    for(let i=0;i<files.length;i++) photos.push(await putInputPhoto(order.id,i,files[i]));
    const updated=await pool().query("UPDATE zombievideolab_pro.billing_orders SET input_photos=$2,prompt_scenario=$3,updated_at=now() WHERE id=$1 AND status='pending' AND input_photos='[]'::jsonb RETURNING id",[order.id,JSON.stringify(photos),scenario]);
    if(!updated.rowCount) throw new Error("Photos are still being saved. Please try again shortly.");
    return {...order,input_photos:photos,prompt_scenario:scenario};
  } catch (error) {
    await deleteInputPhotos(photos).catch(()=>{});
    throw error;
  }

}

export async function checkoutFor(order:Order,origin:string) {

  if(order.status!=="pending") throw new Error("This order is not awaiting payment. Check your saved orders.");

  if(order.environment!==stripeEnvironment()) throw new Error("Payment environment changed. Contact support with your code.");

  if(order.input_photos.length!==requiredPhotoCount(order.template_id,order.scene_id)) throw new Error("Photos are still being saved. Please try again shortly or create a new video code.");

  const row=(await pool().query<{provider_checkout_id:string|null;checkout_url:string|null;status:string;expires_at:Date}>("SELECT * FROM zombievideolab_pro.billing_checkouts WHERE order_id=$1",[order.id])).rows[0];

  if(!row || !["creating","open"].includes(row.status) || row.expires_at.getTime()<Date.now()) throw new Error("Checkout expired. Generate a new video code; no new payment was taken.");

  if(row.provider_checkout_id && row.checkout_url) return row.checkout_url;

  if(!row.provider_checkout_id && new Date(row.expires_at).getTime()<Date.now()+31*60000) throw new Error("This checkout expired. Create a new video code to try again.");

  if(!order.stripe_price_id || !order.stripe_product_id) throw new Error("This order uses an older price configuration. Create a new video code; no payment was taken.");
  const stripe=stripeClient();
  const price=await stripe.prices.retrieve(order.stripe_price_id,{expand:["product"]});
  if(!matchesStripePrice(order,price)) throw new Error("This video option has a payment price mismatch. Please contact support; no payment was taken.");

  const session=await stripe.checkout.sessions.create({

    mode:"payment",allowed_payment_method_types:["card"],client_reference_id:order.id,

    metadata:{order_id:order.id,video_code:order.code,template_id:order.template_id},payment_intent_data:{metadata:{order_id:order.id,video_code:order.code,template_id:order.template_id}},

    line_items:[{quantity:1,price:order.stripe_price_id}],
    adaptive_pricing:{enabled:false},

    success_url:`${origin}${videoTemplate(order.template_id).path}?checkout=success&code=${order.code}#generator`,cancel_url:`${origin}${videoTemplate(order.template_id).path}?checkout=cancel&code=${order.code}#generator`,

    expires_at:Math.floor(row.expires_at.getTime()/1000)

  },{idempotencyKey:`zvl-checkout-${order.environment}-${order.id}`});

  if(!session.url) throw new Error("Stripe did not return a checkout URL.");

  await pool().query(`UPDATE zombievideolab_pro.billing_checkouts SET provider_checkout_id=$2,checkout_url=$3,

    status=CASE WHEN status='creating' THEN 'open' ELSE status END,updated_at=now() WHERE order_id=$1`,[order.id,session.id,session.url]);

  return session.url;

}

async function acceptSession(db:PoolClient,session:Stripe.Checkout.Session) {

  const id=session.metadata?.order_id;

  if(!id || !/^[A-F0-9]{32}$/.test(id)) return null; // Other apps can share the Stripe account.

  const order=(await db.query<Order>("SELECT * FROM zombievideolab_pro.billing_orders WHERE id=$1 FOR UPDATE",[id])).rows[0];

  if(!order) return null;

  const checkout=(await db.query<{provider_checkout_id:string|null}>("SELECT provider_checkout_id FROM zombievideolab_pro.billing_checkouts WHERE order_id=$1 FOR UPDATE",[id])).rows[0];

  if(!checkout || checkout.provider_checkout_id && checkout.provider_checkout_id!==session.id) throw new Error("Payment session mismatch");

  if(!matchesPaidSession(order,session)) throw new Error("Payment verification failed");

  const payment=typeof session.payment_intent==="string"?session.payment_intent:session.payment_intent?.id;

  if(!payment) throw new Error("Payment intent missing");

  await db.query(`UPDATE zombievideolab_pro.billing_checkouts SET provider_checkout_id=$2,status='complete',updated_at=now() WHERE order_id=$1`,[id,session.id]);

  const revoked=(await db.query("SELECT status FROM zombievideolab_pro.billing_payment_blocks WHERE payment_id=$1 AND environment=$2",[payment,order.environment])).rows[0];

  if(revoked) {

    await db.query("UPDATE zombievideolab_pro.billing_orders SET status=$2,provider_payment_id=$3,updated_at=now() WHERE id=$1",[id,revoked.status,payment]);

    return null;

  }

  await db.query(`UPDATE zombievideolab_pro.billing_orders SET status='paid',provider_payment_id=$2,paid_at=COALESCE(paid_at,now()),

    generation_status=CASE WHEN generation_status='waiting' THEN 'ready' ELSE generation_status END,updated_at=now()

    WHERE id=$1 AND status IN ('pending','expired','failed')`,[id,payment]);

  return id;

}

export async function reconcileOrder(order:Order) {

  if(order.provider!=="stripe" || order.status!=="pending" || order.environment!==stripeEnvironment()) return;

  const checkout=(await pool().query<{provider_checkout_id:string|null}>("SELECT provider_checkout_id FROM zombievideolab_pro.billing_checkouts WHERE order_id=$1",[order.id])).rows[0];

  if(!checkout?.provider_checkout_id) return;

  const session=await stripeClient().checkout.sessions.retrieve(checkout.provider_checkout_id);

  if(session.payment_status!=="paid") return;

  const db=await pool().connect();

  try { await db.query("BEGIN"); await acceptSession(db,session); await db.query("COMMIT"); }

  catch(e) {await db.query("ROLLBACK");throw e;} finally {db.release();}

}

export async function processStripeEvent(event:Stripe.Event) {

  const db=await pool().connect();

  try {

    await db.query("BEGIN");

    const inserted=await db.query(`INSERT INTO zombievideolab_pro.billing_webhook_events(provider,provider_event_id,event_type,environment)

      VALUES('stripe',$1,$2,$3) ON CONFLICT DO NOTHING RETURNING provider_event_id`,[event.id,event.type,event.livemode?"live":"test"]);

    if(!inserted.rowCount) {await db.query("COMMIT");return null;}

    let ready:string|null=null;

    if(event.type==="checkout.session.completed" || event.type==="checkout.session.async_payment_succeeded") {

      const session=event.data.object as Stripe.Checkout.Session;

      if(session.payment_status==="paid") ready=await acceptSession(db,session);

    } else if(event.type==="checkout.session.expired" || event.type==="checkout.session.async_payment_failed") {

      const session=event.data.object as Stripe.Checkout.Session;

      const status=event.type.endsWith("expired")?"expired":"failed";

      await db.query(`UPDATE zombievideolab_pro.billing_orders o SET status=$2,updated_at=now() FROM zombievideolab_pro.billing_checkouts c

        WHERE c.order_id=o.id AND c.provider_checkout_id=$1 AND o.status='pending' AND o.environment=$3`,[session.id,status,event.livemode?"live":"test"]);

      await db.query("UPDATE zombievideolab_pro.billing_checkouts SET status=$2,updated_at=now() WHERE provider_checkout_id=$1 AND status<>'complete'",[session.id,status]);

    } else if(event.type==="charge.refunded") {

      const charge=event.data.object as Stripe.Charge;

      const payment=typeof charge.payment_intent==="string"?charge.payment_intent:charge.payment_intent?.id;

      if(payment && charge.amount_refunded>0) await db.query(`INSERT INTO zombievideolab_pro.billing_payment_blocks(payment_id,environment,status) VALUES($1,$2,'refunded') ON CONFLICT DO NOTHING`,[payment,event.livemode?"live":"test"]);

      await db.query(`UPDATE zombievideolab_pro.billing_orders SET status='refunded',refund_amount_minor=GREATEST(refund_amount_minor,$2),refunded_at=now(),updated_at=now()

        WHERE provider_payment_id=$1 AND environment=$3 AND $2>0`,[payment,charge.amount_refunded,event.livemode?"live":"test"]);

    } else if(event.type==="charge.dispute.created") {

      const dispute=event.data.object as Stripe.Dispute;

      const payment=typeof dispute.payment_intent==="string"?dispute.payment_intent:dispute.payment_intent?.id;

      if(payment) await db.query(`INSERT INTO zombievideolab_pro.billing_payment_blocks(payment_id,environment,status) VALUES($1,$2,'disputed') ON CONFLICT DO NOTHING`,[payment,event.livemode?"live":"test"]);

      await db.query("UPDATE zombievideolab_pro.billing_orders SET status='disputed',updated_at=now() WHERE provider_payment_id=$1 AND environment=$2",[payment,event.livemode?"live":"test"]);

    }

    await db.query("COMMIT");return ready;

  } catch(e) {await db.query("ROLLBACK");throw e;} finally {db.release();}

}
