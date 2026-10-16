// Shared by the server client and the Node catalog configuration script.
// Restricted keys use the same test/live environments as standard secret keys.
export function stripeKeyEnvironment(key: string | undefined): "test" | "live" | null {
  const match = /^(?:sk|rk)_(test|live)_[A-Za-z0-9]{24,}$/.exec(key?.trim() || "");
  return match ? match[1] as "test" | "live" : null;
}
