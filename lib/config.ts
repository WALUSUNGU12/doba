// Centralized API Configuration - Single source of truth
// To switch between environments, change the MODE value

const MODE = 'production'; // Options: 'production' | 'development'

const config = {
  production: {
    API_URL: 'https://api-doba.techgenesismw.com',
    APP_URL: 'https://dobadoba.techgenesismw.com'
  },
  development: {
    API_URL: 'http://localhost:5000',
    APP_URL: 'http://localhost:3000'
  }
};

export const API_URL = config[MODE].API_URL;
export const APP_URL = config[MODE].APP_URL;
export const CURRENT_MODE = MODE;