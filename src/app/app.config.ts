import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { Amplify } from 'aws-amplify';
import { cognitoConfig } from './cognito.config';
import { authInterceptor } from './interceptors/auth.interceptor';

// Configure AWS Amplify with PKCE support
Amplify.configure(cognitoConfig);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};
