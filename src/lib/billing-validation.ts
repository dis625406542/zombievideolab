import type Stripe from "stripe";
export function matchesPaidSession(order: {id:string;code:string;environment:string;amount_minor:number;currency:string}, session: Stripe.Checkout.Session) {
  return session.mode === "payment" && session.status === "complete" && session.payment_status === "paid"
    && session.client_reference_id === order.id && session.metadata?.order_id === order.id && session.metadata?.video_code === order.code
    && session.livemode === (order.environment === "live") && session.amount_total === order.amount_minor
    && session.currency?.toUpperCase() === order.currency;
}

export function matchesStripePrice(order: {
  stripe_price_id: string | null; stripe_product_id: string | null;
  environment: string; amount_minor: number; currency: string;
}, price: Stripe.Price) {
  const product = price.product;
  return price.id === order.stripe_price_id && price.active && price.type === "one_time"
    && price.livemode === (order.environment === "live")
    && price.unit_amount === order.amount_minor && price.currency.toUpperCase() === order.currency
    && price.billing_scheme === "per_unit" && !price.transform_quantity
    && typeof product !== "string" && !product.deleted && product.active
    && product.id === order.stripe_product_id;
}
