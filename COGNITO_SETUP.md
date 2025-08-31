# AWS Cognito Setup Guide

This guide walks you through setting up AWS Cognito for the Angular authentication demo.

## Prerequisites

- AWS Account
- Access to AWS Cognito Console
- Basic understanding of OAuth 2.0 flows

## Step 1: Create User Pool

1. **Navigate to AWS Cognito Console**
   - Go to AWS Console → Cognito → User Pools
   - Click "Create user pool"

2. **Configure Sign-in Experience**
   - **Cognito user pool sign-in options**: Choose "Email" or "Username"
   - **User name requirements**: Select your preference
   - **Password policy**: Configure according to your security requirements

3. **Configure Security Requirements**
   - **Multi-factor authentication**: Optional (recommended for production)
   - **User account recovery**: Enable if needed

4. **Configure App Integration**
   - **User pool name**: Enter a descriptive name (e.g., "angular-cognito-demo")
   - **Initial app client**: We'll create this in the next step
   - **Hosted UI**: We'll configure this later

5. **Review and Create**
   - Review your settings
   - Click "Create user pool"

## Step 2: Create App Client

1. **Add App Client**
   - In your User Pool, go to "App integration" tab
   - Click "Add an app client"

2. **Configure App Client**
   - **App client name**: Enter a name (e.g., "angular-web-client")
   - **Confidential client**: Select "No" (for public client)
   - **Generate client secret**: Select "No" (for public client)

3. **Configure OAuth Flows**
   - **Authentication flows**: Select "ALLOW_USER_PASSWORD_AUTH" and "ALLOW_REFRESH_TOKEN_AUTH"
   - **OAuth 2.0**: Enable "Authorization code grant"
   - **OAuth 2.0**: Enable "Implicit grant" (optional)

4. **Configure Callback URLs**
   - **Callback URLs**: Add your application URLs
     - Development: `http://localhost:4200/`
     - Production: `https://yourdomain.com/`
   - **Sign-out URLs**: Add the same URLs
   - **Allowed OAuth flows**: Select "Authorization code grant"
   - **Allowed OAuth scopes**: Select "openid", "email", "profile"

5. **Save Configuration**
   - Click "Create app client"

## Step 3: Configure Domain

1. **Set Up Domain**
   - Go to "App integration" tab
   - Under "Domain", click "Add domain"

2. **Choose Domain Type**
   - **Cognito domain**: Enter a unique prefix (e.g., "myapp-auth")
   - **Custom domain**: Optional (requires SSL certificate)

3. **Save Domain**
   - Click "Save changes"

## Step 4: Update Application Configuration

1. **Get Configuration Values**
   - **User Pool ID**: Found in "General settings" tab
   - **App Client ID**: Found in "App integration" tab under your app client
   - **Domain**: Your Cognito domain (e.g., "myapp-auth.auth.us-east-1.amazoncognito.com")

2. **Update Environment Files**

   **Development (`src/environments/environment.ts`):**
   ```typescript
   export const environment = {
     production: false,
     cognito: {
       userPoolId: 'us-east-1_XXXXXXXXX', // Your User Pool ID
       clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Your App Client ID
       oauthDomain: 'https://myapp-auth.auth.us-east-1.amazoncognito.com',
       redirectSignIn: 'http://localhost:4200/',
       redirectSignOut: 'http://localhost:4200/',
       scope: 'openid email profile',
       responseType: 'code'
     }
   };
   ```

   **Production (`src/environments/environment.prod.ts`):**
   ```typescript
   export const environment = {
     production: true,
     cognito: {
       userPoolId: 'us-east-1_XXXXXXXXX', // Your User Pool ID
       clientId: 'XXXXXXXXXXXXXXXXXXXXXXXXXX', // Your App Client ID
       oauthDomain: 'https://myapp-auth.auth.us-east-1.amazoncognito.com',
       redirectSignIn: 'https://yourdomain.com/',
       redirectSignOut: 'https://yourdomain.com/',
       scope: 'openid email profile',
       responseType: 'code'
     }
   };
   ```

## Step 5: Test Configuration

1. **Start Development Server**
   ```bash
   ng serve
   ```

2. **Test Authentication Flow**
   - Navigate to `http://localhost:4200`
   - Click "Sign In with Cognito"
   - You should be redirected to Cognito hosted UI
   - After authentication, you should be redirected back to your app

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure your callback URLs are exactly correct
   - Check for trailing slashes
   - Verify domain configuration

2. **Redirect Issues**
   - Confirm callback URLs match exactly
   - Check that your domain is properly configured
   - Verify OAuth scopes are enabled

3. **Token Issues**
   - Ensure refresh tokens are enabled
   - Check token expiration settings
   - Verify app client configuration

### Debug Mode

Enable debug logging by adding to your environment:
```typescript
export const environment = {
  production: false,
  debug: true,
  cognito: {
    // ... your config
  }
};
```

## Security Best Practices

1. **Use HTTPS in Production**
   - Always use HTTPS for production deployments
   - Configure proper SSL certificates

2. **Token Security**
   - Tokens are stored in localStorage (consider httpOnly cookies for production)
   - Implement proper token refresh logic
   - Monitor token expiration

3. **CORS Configuration**
   - Limit allowed origins in Cognito
   - Use specific callback URLs
   - Avoid wildcard domains

4. **User Pool Security**
   - Enable MFA for sensitive applications
   - Configure strong password policies
   - Set up proper account lockout policies

## Next Steps

1. **Add User Management**
   - Implement user registration
   - Add password reset functionality
   - Configure user attributes

2. **Enhanced Security**
   - Implement MFA
   - Add session management
   - Configure advanced security features

3. **Production Deployment**
   - Set up proper domain configuration
   - Configure SSL certificates
   - Implement monitoring and logging

---

**Need Help?**
- Check AWS Cognito documentation
- Review troubleshooting section
- Create an issue in the repository
