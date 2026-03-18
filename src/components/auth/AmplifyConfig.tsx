"use client";

import { Amplify } from "aws-amplify";
import outputs from "../../../amplify_outputs.json";

// Configure Amplify using the dynamically generated outputs
Amplify.configure(outputs, { ssr: true });

export default function AmplifyConfig({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
