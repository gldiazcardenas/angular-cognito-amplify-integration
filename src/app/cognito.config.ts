import { environment } from '../environments/environment';

export const cognitoConfig = {
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
