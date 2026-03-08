import * as dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  BASE_URL: process.env.BASE_URL || 'https://dummyjson.com',
  TEST_USERNAME: process.env.TEST_USERNAME || 'emilys',
  TEST_PASSWORD: process.env.TEST_PASSWORD || 'emilyspass',
} as const;
