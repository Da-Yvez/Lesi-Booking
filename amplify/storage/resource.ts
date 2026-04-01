import { defineStorage } from '@aws-amplify/backend';

export const storage = defineStorage({
  name: 'lesibookingPaymentProofs',
  access: (allow) => ({
    'listings/*': [
      allow.guest.to(['read']),
      allow.authenticated.to(['read', 'write', 'delete'])
    ],
    'proofs/*': [
      allow.authenticated.to(['read', 'write'])
    ]
  })
});
