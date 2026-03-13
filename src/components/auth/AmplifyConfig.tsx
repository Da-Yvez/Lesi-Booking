"use client";

import { Amplify } from "aws-amplify";

const authConfig = {
  Cognito: {
    userPoolId: process.env.NEXT_PUBLIC_USER_POOL_ID || "",
    userPoolClientId: process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID || "",
    signUpVerificationMethod: "code" as const,
  },
};

Amplify.configure({
  Auth: authConfig,
}, { ssr: true });

export default function AmplifyConfig({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
