export const environment = {
  production: false,
  cognito: {
    userPoolId: 'us-east-1_6DFewMzmv',
    clientId: '74h5hpn35aphlnvj5d1v2egb8h',
    oauthDomain: 'https://angular-demo-gldiaz-1756643115.auth.us-east-1.amazoncognito.com',
    redirectSignIn: 'http://localhost:4200/',
    redirectSignOut: 'http://localhost:4200/',
    scope: 'openid email profile',
    responseType: 'code'
  }
};
