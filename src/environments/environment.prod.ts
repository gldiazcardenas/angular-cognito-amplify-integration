export const environment = {
  production: true,
  cognito: {
    userPoolId: 'us-east-1_6DFewMzmv',
    clientId: '74h5hpn35aphlnvj5d1v2egb8h',
    oauthDomain: 'angular-cognito-amplify-2025.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'https://yourdomain.com/',
    redirectSignOut: 'https://yourdomain.com/',
    scope: 'openid email profile',
    responseType: 'code'
  }
};
