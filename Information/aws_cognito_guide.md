# AWS Cognito Authentication Guide (Manual Setup)

This document summarizes the manual setup of AWS Cognito for the **LesiBooking** platform, ensuring a professional and scalable security architecture.

## 1. Cognito User Pool (The Brain)
- **Role**: A secure identity provider that handles password storage, hashing, and authentication tokens.
- **Sign-in Identifiers**: Configured as **Email** (primary) and **Phone** (optional for future use).
- **Public Client**: Set up as a Single-Page Application (SPA) to allow the frontend to talk to AWS without needing a client secret (which is insecure in browser code).

## 2. Distinct Account Roles (The Tag System)
To distinguish between **Customers** and **Business Owners**, we use a **Custom Attribute**:
- **Attribute Name**: `custom:role`
- **Logic**: 
  - When a user signs up as a "Customer", we set this attribute to `customer`.
  - When a user signs up as a "Business", we set this attribute to `business`.
- **Why?**: This allows the frontend to redirect users to different dashboards immediately after login.

## 3. The Frontend Connection (The Bridge)
The Next.js application connects to Cognito using two specific identifiers:
1. **User Pool ID**: identifies exactly which user pool to talk to.
2. **App Client ID**: the unique "key" assigned to the frontend application.

These are stored in [.env.local](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/.env.local) with the `NEXT_PUBLIC_` prefix to make them available to the browser:
```env
NEXT_PUBLIC_USER_POOL_ID=ap-southeast-1_XXXXXXXXX
NEXT_PUBLIC_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 4. Key Security Features
- **MFA (Optional)**: Can be enabled later for extra security.
- **Self-Registration**: Users can create their own accounts.
- **Verification**: Email-based verification codes are sent automatically by AWS during sign-up.

## 5. Troubleshooting Common Issues
- **"Auth UserPool not configured"**: Usually means the development server needs to be restarted after updating [.env.local](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/.env.local) or the variable names are missing the `NEXT_PUBLIC_` prefix.
