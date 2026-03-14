import { fetchUserAttributes } from "aws-amplify/auth";

export type UserRole = "customer" | "business" | "admin";

export type AuthState =
  | { authed: true; role: UserRole; email: string }
  | { authed: false };

export async function getAuthState(): Promise<AuthState> {
  try {
    const attrs = await fetchUserAttributes();
    const role = (attrs["custom:role"] as UserRole) || "customer";
    const email = attrs.email || "";
    return { authed: true, role, email };
  } catch {
    return { authed: false };
  }
}
