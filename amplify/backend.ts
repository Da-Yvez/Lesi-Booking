import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { storage } from './storage/resource';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
const backend = defineBackend({
  data,
  storage,
});

const authStack = backend.createStack('AuthStack');

// 1. Import existing User Pool
const userPool = cognito.UserPool.fromUserPoolId(
  authStack,
  'ImportedUserPool',
  'ap-southeast-1_oCoWUKzDu' // Hardcoded from .env.local
);

const userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(
  authStack,
  'ImportedUserPoolClient',
  '3177kea77p1gmrcpp5k3her4mj' // Hardcoded from .env.local
);

// 2. Create a new Identity Pool
const identityPool = new cognito.CfnIdentityPool(authStack, 'IdentityPool', {
  allowUnauthenticatedIdentities: true,
  cognitoIdentityProviders: [
    {
      clientId: userPoolClient.userPoolClientId,
      providerName: userPool.userPoolProviderName,
    },
  ],
});

// 3. Define the Authenticated Role for the Identity Pool
const authenticatedRole = new iam.Role(authStack, 'AuthenticatedRole', {
  assumedBy: new iam.FederatedPrincipal(
    'cognito-identity.amazonaws.com',
    {
      StringEquals: {
        'cognito-identity.amazonaws.com:aud': identityPool.ref,
      },
      'ForAnyValue:StringLike': {
        'cognito-identity.amazonaws.com:amr': 'authenticated',
      },
    },
    'sts:AssumeRoleWithWebIdentity'
  ),
});

// 4. Define the Unauthenticated Role for the Identity Pool
const unauthenticatedRole = new iam.Role(authStack, 'UnauthenticatedRole', {
  assumedBy: new iam.FederatedPrincipal(
    'cognito-identity.amazonaws.com',
    {
      StringEquals: {
        'cognito-identity.amazonaws.com:aud': identityPool.ref,
      },
      'ForAnyValue:StringLike': {
        'cognito-identity.amazonaws.com:amr': 'unauthenticated',
      },
    },
    'sts:AssumeRoleWithWebIdentity'
  ),
});

// 5. Attach the roles to the Identity Pool
new cognito.CfnIdentityPoolRoleAttachment(authStack, 'IdentityPoolRoleAttachment', {
  identityPoolId: identityPool.ref,
  roles: {
    authenticated: authenticatedRole.roleArn,
    unauthenticated: unauthenticatedRole.roleArn,
  },
});

// 6. CRITICAL: Tell Amplify to use these Roles for resource access
backend.storage.resources.bucket.grantReadWrite(authenticatedRole);
backend.storage.resources.bucket.grantDelete(authenticatedRole);
backend.storage.resources.bucket.grantRead(unauthenticatedRole);

// Output the Identity Pool ID so the frontend can find it
backend.addOutput({
  auth: {
    aws_region: 'ap-southeast-1',
    user_pool_id: userPool.userPoolId,
    user_pool_client_id: userPoolClient.userPoolClientId,
    identity_pool_id: identityPool.ref,
    standard_required_attributes: ['email'],
    username_attributes: ['email'],
    user_verification_types: ['email'],
    unauthenticated_identities_enabled: true,
    mfa_configuration: 'NONE',
    password_policy: {
      min_length: 8,
      require_lowercase: true,
      require_uppercase: true,
      require_numbers: true,
      require_symbols: true,
    },
  },
});
