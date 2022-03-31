import {envValueResolver} from './enviroment-utils'

export const environment = {
  production: true,
  api: {
    backend: `https://localhost:4200/rest`,
    server: `https://localhost:4200`,
    apiKey: `debug`,
    envValueResolver: envValueResolver
  },
  data: {
    'email': 'noreply@mail.com',
    'ags': '99000110'
  }
};
