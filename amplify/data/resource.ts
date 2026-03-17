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
      
      // Personal Info
      fullName: a.string().required(),
      nicNumber: a.string().required(),
      dateOfBirth: a.string().required(),
      nationality: a.string().required(),
      
      // Contact Info
      email: a.string().required(),
      phone: a.string().required(),
      whatsapp: a.string(),
      streetAddress: a.string().required(),
      city: a.string().required(),
      province: a.string(),
      postalCode: a.string(),
      
      // Business Info
      businessName: a.string().required(),
      registrationNumber: a.string(),
      businessType: a.string().required(),
      taxId: a.string(),
      yearsInOperation: a.string(),
      numberOfEmployees: a.string(),
      
      // Payment Info
      paymentMethod: a.string().required(),
      referenceNumber: a.string().required(),
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
