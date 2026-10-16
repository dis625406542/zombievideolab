import "server-only";
import { enabled } from "./video-access";
import { stripeConfigured } from "./stripe";
export function checkoutReady() {return enabled() && stripeConfigured();}
