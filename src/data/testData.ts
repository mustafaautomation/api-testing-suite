import { ENV } from '../config/env';

export const TEST_CREDENTIALS = {
  valid: {
    username: ENV.TEST_USERNAME,
    password: ENV.TEST_PASSWORD,
  },
  invalidPassword: {
    username: ENV.TEST_USERNAME,
    password: 'wrongpassword',
  },
  invalidUsername: {
    username: 'nonexistentuser999',
    password: 'somepassword',
  },
};

export const NEW_USER = {
  firstName: 'Muhammad',
  lastName: 'Mustafa',
  age: 30,
  email: 'muhammad@example.com',
  username: 'muhammadm',
};

export const VALID_USER_IDS = [1, 2, 3, 4, 5];
