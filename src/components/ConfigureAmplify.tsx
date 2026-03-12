'use client';

import { Amplify } from 'aws-amplify';
import outputs from '../../amplify_outputs.json';

try {
  Amplify.configure(outputs);
} catch (error) {
  console.warn('Amplify has not been configured yet. Deploy to AWS or run sandbox to generate amplify_outputs.json', error);
}

export default function ConfigureAmplifyClientSide() {
  return null;
}
