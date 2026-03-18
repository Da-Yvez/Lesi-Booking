import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  BusinessProfile: a
    .model({
      name: a.string().required(),
      description: a.string(),
      address: a.string(),
      phone: a.string(),
      services: a.hasMany('Service', 'businessId'),
      operatingHours: a.hasMany('OperatingHours', 'businessId'),
      appointments: a.hasMany('Appointment', 'businessId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Service: a
    .model({
      businessId: a.id().required(),
      business: a.belongsTo('BusinessProfile', 'businessId'),
      name: a.string().required(),
      description: a.string(),
      durationMinutes: a.integer().required(),
      price: a.float(),
      appointments: a.hasMany('Appointment', 'serviceId'),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  OperatingHours: a
    .model({
      businessId: a.id().required(),
      business: a.belongsTo('BusinessProfile', 'businessId'),
      dayOfWeek: a.integer().required(),
      startTime: a.string().required(),
      endTime: a.string().required(),
      isClosed: a.boolean().required(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Appointment: a
    .model({
      businessId: a.id().required(),
      business: a.belongsTo('BusinessProfile', 'businessId'),
      serviceId: a.id().required(),
      service: a.belongsTo('Service', 'serviceId'),
      customerName: a.string().required(),
      customerPhone: a.string().required(),
      customerEmail: a.string(),
      startTime: a.datetime().required(),
      endTime: a.datetime().required(),
      status: a.enum(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED']),
      notes: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // ── Business Registration (KYC / Identity Verification) ──────────────────
  // Submitted from dashboard Business Info tab. Approved by admin before partner can buy a plan.
  BusinessRegistration: a
    .model({
      ownerEmail: a.string().required(), // links to Cognito user
      submittedAt: a.datetime().required(),
      status: a.enum(['draft', 'pending_business_approval', 'business_approved', 'rejected']),

      // A. Owner Identity
      fullName: a.string(),
      nicNumber: a.string(),
      dateOfBirth: a.string(),
      nationality: a.string(),
      ownerRole: a.string(),

      // B. Business Legal Identity
      businessLegalName: a.string(),
      businessBrandName: a.string(),
      registrationNumber: a.string(),
      legalStructure: a.string(),
      taxId: a.string(),
      countryOfRegistration: a.string(),
      yearsInOperation: a.string(),

      // C & D. Contact & Presence
      email: a.string(),
      phone: a.string(),
      whatsapp: a.string(),
      city: a.string(),
      province: a.string(),
      country: a.string(),
      hasPhysicalLocation: a.boolean(),
      numberOfBranches: a.string(),

      // E. Business Profile
      category: a.string(),
      shortDescription: a.string(),
      targetCustomers: a.string(),

      // F. Compliance Documents (S3 Keys)
      registrationFileKey: a.string(),
      ownerNicFileKey: a.string(),
      taxFileKey: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  // ── Partner Submission (Plan Purchase + Payment) ───────────────────────────
  // Submitted from /partner/checkout. Requires an approved BusinessRegistration.
  PartnerSubmission: a
    .model({
      submittedAt: a.datetime().required(),
      status: a.enum(['pending_partner_approval', 'partner_approved', 'rejected']),
      plan: a.enum(['monthly', 'annual']),
      planPrice: a.string(),

      // Link to approved business registration
      businessRegistrationId: a.string(),

      // Denormalised owner/business info (kept for backward compat & admin display)
      fullName: a.string(),
      nicNumber: a.string(),
      dateOfBirth: a.string(),
      nationality: a.string(),
      ownerRole: a.string(),
      businessLegalName: a.string(),
      businessBrandName: a.string(),
      registrationNumber: a.string(),
      legalStructure: a.string(),
      taxId: a.string(),
      countryOfRegistration: a.string(),
      yearsInOperation: a.string(),
      email: a.string(),
      phone: a.string(),
      whatsapp: a.string(),
      city: a.string(),
      province: a.string(),
      country: a.string(),
      hasPhysicalLocation: a.boolean(),
      numberOfBranches: a.string(),
      category: a.string(),
      shortDescription: a.string(),
      targetCustomers: a.string(),
      registrationFileKey: a.string(),
      ownerNicFileKey: a.string(),
      taxFileKey: a.string(),

      // Payment
      paymentMethod: a.string(),
      referenceNumber: a.string(),
      proofFileKey: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
