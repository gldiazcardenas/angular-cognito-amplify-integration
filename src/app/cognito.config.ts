import { environment } from '../environments/environment';
import { ResourcesConfig } from '@aws-amplify/core';

export const cognitoConfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: environment.cognito.userPoolId,
      userPoolClientId: environment.cognito.clientId,
      loginWith: {
        oauth: {
          domain: environment.cognito.oauthDomain,
          scopes: environment.cognito.scope.split(' '),
          responseType: 'code' as const,
          redirectSignIn: [environment.cognito.redirectSignIn],
          redirectSignOut: [environment.cognito.redirectSignOut]
        }
      }
    }
  }
};
