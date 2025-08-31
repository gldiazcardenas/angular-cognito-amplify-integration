export const environment = {
  production: true,
  cognito: {
    userPoolId: '{{CognitoUserPoolId}}',
    clientId: '{{CognitoAppClientId}}',
    oauthDomain: '{{CognitoDomainPrefix}}.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://yourdomain.com/',
    redirectSignOut: 'https://yourdomain.com/',
    scope: 'openid email profile',
    responseType: 'code'
  }
};
