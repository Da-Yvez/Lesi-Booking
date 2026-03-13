"use client";

import { Amplify } from "aws-amplify";

const authConfig = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "",
    signUpVerificationMethod: "code" as const,
    loginWith: {
      oauth: {
        domain: process.env.NEXT_PUBLIC_USER_POOL_DOMAIN || "",
        scopes: ["email", "profile", "openid"],
        redirectSignIn: ["http://localhost:3000/"],
        redirectSignOut: ["http://localhost:3000/"],
        responseType: "code" as const,
      },
    },
  },
};

Amplify.configure({
  Auth: authConfig,
}, { ssr: true });

export default function AmplifyConfig({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
