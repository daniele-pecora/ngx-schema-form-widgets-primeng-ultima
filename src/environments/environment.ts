// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import {envValueResolver} from './enviroment-utils'

export const environment = {
  production: false,
  api: {
    xbackend: `https://localhost:4200/rest`,
    backend: `https://egov-test.hsh-berlin.com/IRWSBV/rest`,
    server: `https://localhost:4444`,
    apiKey: `debug`,
    envValueResolver: envValueResolver
  },
  data: {
    'email': 'noreply@mail.com',
    'ags': '99000110'
  }
};
