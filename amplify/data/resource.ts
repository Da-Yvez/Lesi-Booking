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

  PartnerSubmission: a
    .model({
      submittedAt: a.datetime().required(),
      status: a.enum(['pending_partner_approval', 'partner_approved', 'rejected']),
      plan: a.enum(['monthly', 'annual']),
      planPrice: a.string(),
      
      // A. Owner Identity (Mandatory in UI)
      fullName: a.string(),
      nicNumber: a.string(),
      dateOfBirth: a.string(),
      nationality: a.string(),
      ownerRole: a.string(), // Owner, Director, Manager
      
      // B. Business Legal Identity (Mandatory in UI)
      businessLegalName: a.string(),
      businessBrandName: a.string(),
      registrationNumber: a.string(),
      legalStructure: a.string(), // Sole Proprietor, Pvt Ltd, Partnership
      taxId: a.string(),
      countryOfRegistration: a.string(),
      yearsInOperation: a.string(),
      
      // C & D. Contact & Presence (Mandatory in UI)
      email: a.string(),
      phone: a.string(),
      whatsapp: a.string(),
      city: a.string(),
      province: a.string(),
      country: a.string(),
      hasPhysicalLocation: a.boolean(),
      numberOfBranches: a.string(),
      
      // E. Business Profile (Optional)
      category: a.string(),
      shortDescription: a.string(),
      targetCustomers: a.string(),
      
      // F. Compliance & Documents (S3 Keys - Optional for MVP)
      registrationFileKey: a.string(),
      ownerNicFileKey: a.string(),
      taxFileKey: a.string(),
      
      // Payment Info
      paymentMethod: a.string(),
      referenceNumber: a.string(),
      proofFileKey: a.string(), // key to S3 object
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
