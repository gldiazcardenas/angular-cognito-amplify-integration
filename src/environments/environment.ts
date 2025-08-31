export const environment = {
  production: false,
  cognito: {
    userPoolId: '{{CognitoUserPoolId}}',
    clientId: '{{CognitoAppClientId}}',
    oauthDomain: '{{CognitoDomainPrefix}}.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
    scope: 'openid email profile',
    responseType: 'code'
  }
};
