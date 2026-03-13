# Google Authentication Implementation Guide

This document details how Google Social Authentication was integrated into the LesiBooking platform using AWS Cognito and AWS Amplify.

## 1. Google Cloud Console Setup
- **Project**: Created a project in the Google Cloud Console.
- **OAuth Consent Screen**: Configured as "External" with basic app information.
- **OAuth Client ID**: Created a "Web application" credential.
    - **Authorized Redirect URIs**: Added the Cognito Domain response URL:
      `https://ap-southeast-1ocowukzdu.auth.ap-southeast-1.amazoncognito.com/oauth2/idpresponse`
- **Credentials**: Obtained the `Client ID` and `Client Secret`.

## 2. AWS Cognito Configuration
- **Identity Provider**: Added Google under the "Sign-in" -> "Social and external providers" section.
    - Entered Google Client ID and Secret.
    - Set Scopes: `profile email openid`.
    - Mapped Google `email` attribute to User Pool `email`.
- **Cognito Domain**: Verified the existence of a Cognito-hosted domain for OAuth handshakes.
- **App Client Settings**:
    - Enabled **Google** as an Identity Provider.
    - Added Callback URLs: `http://localhost:3000/` and the production CloudFront URL.
    - Enabled Scopes: `email`, `openid`, `profile`.

## 3. Frontend Integration
- **Environment Variables**: Added `NEXT_PUBLIC_USER_POOL_DOMAIN` to [.env.local](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/.env.local).
- **Amplify Configuration**: Updated [AmplifyConfig.tsx](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/src/components/auth/AmplifyConfig.tsx) to include the `oauth` block within the [Auth](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/src/components/auth/AuthForm.tsx#22-290) configuration.
- **Auth UI**:
    - Implemented `signInWithRedirect({ provider: 'Google' })` in [AuthForm.tsx](file:///mnt/Stuff/Data/Yvexa/Projects/Booking%20Platform/src/components/auth/AuthForm.tsx).
    - Reordered the UI to prioritize traditional login and added a visual "Or" separator before the Google button.

## 4. Role Handling (Enforcement)
- Final implementation requires users to select a role (**Customer** or **Business**) before the Google button becomes active.
- This ensures that when the user returns from Google, the application knows which group and dashboard to assign them to.
