import "server-only";
import Stripe from "stripe";
import { stripeKeyEnvironment } from "./stripe-key";
export function stripeConfigured() {
  const key = process.env.STRIPE_SECRET_KEY?.trim() || "";
  const webhook = process.env.STRIPE_WEBHOOK_SECRET?.trim() || "";
  return process.env.STRIPE_ENABLED === "true" && stripeKeyEnvironment(key) !== null && /^whsec_[A-Za-z0-9]{24,}$/.test(webhook);
}
export function stripeEnvironment(): "test" | "live" {
  const environment = stripeKeyEnvironment(process.env.STRIPE_SECRET_KEY);
  if (!environment) throw new Error("Stripe payments are not configured. Please contact support.");
  return environment;
}
export function stripeClient() {
  if (!stripeConfigured()) throw new Error("Stripe payments are not configured. Please contact support.");
  return new Stripe(process.env.STRIPE_SECRET_KEY!.trim(), {timeout: 20000, maxNetworkRetries: 2});
}
