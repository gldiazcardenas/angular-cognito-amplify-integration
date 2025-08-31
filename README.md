# Angular Cognito Authentication Demo

A complete Angular 20 application demonstrating AWS Cognito authentication with hosted UI, featuring automatic token refresh and secure route protection.

## 🚀 Features

- **AWS Cognito Integration** - Secure authentication using Cognito hosted UI
- **PKCE Support** - Built-in security with Proof Key for Code Exchange
- **Automatic Token Refresh** - Seamless user experience with background token management
- **Route Protection** - Secure routes with authentication guards
- **Modern Angular** - Built with Angular 20 and standalone components
- **Responsive UI** - Beautiful, modern interface with gradient backgrounds
- **TypeScript** - Full type safety throughout the application

## 📋 Prerequisites

- Node.js (v18 or higher)
- Angular CLI (v20 or higher)
- AWS Account with Cognito User Pool configured

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd angular-cognito-integration-demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS Cognito**
   - Create a Cognito User Pool in AWS Console
   - Create an App Client with hosted UI enabled
   - Configure OAuth settings and redirect URIs

4. **Update environment configuration**
   - Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`
   - Replace placeholder values with your Cognito configuration

## ⚙️ Configuration

### Environment Setup

Update the following files with your Cognito configuration:

**Development (`src/environments/environment.ts`):**
```typescript
export const environment = {
  production: false,
  cognito: {
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
    oauthDomain: 'https://YOUR_OAUTH_DOMAIN.auth.region.amazoncognito.com',
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
    userPoolId: 'YOUR_USER_POOL_ID',
    clientId: 'YOUR_CLIENT_ID',
    oauthDomain: 'https://YOUR_OAUTH_DOMAIN.auth.region.amazoncognito.com',
    redirectSignIn: 'https://yourdomain.com/',
    redirectSignOut: 'https://yourdomain.com/',
    scope: 'openid email profile',
    responseType: 'code'
  }
};
```

### AWS Cognito Setup

1. **Create User Pool**
   - Go to AWS Cognito Console
   - Create a new User Pool
   - Configure sign-in experience (email/username)
   - Set password requirements

2. **Create App Client**
   - Add an App Client to your User Pool
   - Enable "Hosted UI" for OAuth flows
   - Configure callback URLs:
     - Development: `http://localhost:4200/`
     - Production: `https://yourdomain.com/`
   - Set OAuth scopes: `openid`, `email`, `profile`

3. **Configure Domain**
   - Set up a Cognito domain (e.g., `your-app.auth.region.amazoncognito.com`)
   - This will be your `oauthDomain` in the configuration

## 🏗️ Project Structure

```
src/app/
├── views/                    # Page-level components
│   ├── home/                # Landing page with login
│   │   ├── home.component.ts
│   │   ├── home.component.html
│   │   └── home.component.css
│   └── welcome/             # Protected welcome page
│       ├── welcome.component.ts
│       ├── welcome.component.html
│       └── welcome.component.css
├── services/                # Business logic
│   ├── auth.service.ts      # Authentication logic
│   └── token.service.ts     # Token management
├── guards/                  # Route protection
│   └── auth.guard.ts        # Authentication guard
├── interceptors/            # HTTP interceptors
│   └── auth.interceptor.ts  # Token injection
├── environments/            # Environment configuration
│   ├── environment.ts       # Development config
│   └── environment.prod.ts  # Production config
└── cognito.config.ts        # AWS Amplify configuration
```

## 🔐 Authentication Flow

1. **User Access** - User visits protected route
2. **Auth Check** - AuthGuard checks authentication status
3. **Redirect** - If not authenticated, redirect to Cognito hosted UI
4. **Login** - User authenticates via Cognito hosted UI
5. **Callback** - Cognito redirects back with authorization code
6. **Token Exchange** - App exchanges code for tokens
7. **Session** - User session established, redirect to protected content
8. **Monitoring** - Background token refresh every 5 minutes

## 🚀 Running the Application

### Development
```bash
ng serve
```
Navigate to `http://localhost:4200`

### Production Build
```bash
ng build --configuration production
```

### Testing
```bash
ng test
```

## 🔧 Key Components

### Authentication Service (`auth.service.ts`)
- Handles Cognito hosted UI authentication
- Manages user sessions and tokens
- Provides automatic token refresh
- Handles authentication callbacks

### Token Service (`token.service.ts`)
- Secure token storage in localStorage
- Token expiration checking
- Token refresh coordination
- Session state management

### Auth Guard (`auth.guard.ts`)
- Protects routes from unauthorized access
- Redirects unauthenticated users to login
- Integrates with authentication service

### HTTP Interceptor (`auth.interceptor.ts`)
- Automatically adds authentication headers
- Handles token injection for API requests
- Manages request/response flow

## 🎨 UI Components

### Home Page
- Landing page with login button
- Shows authentication status
- Provides navigation to protected content
- Handles logout functionality

### Welcome Page
- Protected content for authenticated users
- Displays user information
- Shows authentication details
- Provides logout option

## 🔒 Security Features

- **PKCE Support** - Prevents authorization code interception
- **Secure Token Storage** - Tokens stored in localStorage with expiration
- **Automatic Token Refresh** - Seamless user experience
- **Route Protection** - Guards prevent unauthorized access
- **HTTPS Enforcement** - Production builds require HTTPS
- **State Parameter** - Prevents CSRF attacks

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure Cognito domain is properly configured
   - Check callback URLs in Cognito App Client

2. **Token Refresh Failures**
   - Verify refresh token is enabled in Cognito
   - Check token expiration settings

3. **Redirect Issues**
   - Confirm redirect URIs match exactly
   - Check for trailing slashes in URLs

4. **Build Errors**
   - Ensure all dependencies are installed
   - Check TypeScript configuration

### Debug Mode

Enable debug logging by adding to `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  debug: true, // Add this line
  cognito: {
    // ... existing config
  }
};
```

## 📝 API Reference

### AuthService Methods

```typescript
// Check authentication status
isAuthenticated(): boolean

// Get current user
getCurrentUser(): Promise<User>

// Login (redirects to Cognito)
login(): Promise<void>

// Logout
logout(): Promise<void>

// Get access token
getAccessToken(): string | null

// Refresh tokens
refreshTokens(): Promise<void>
```

### TokenService Methods

```typescript
// Store tokens
setTokens(tokens: AuthTokens): void

// Get stored tokens
getTokens(): AuthTokens | null

// Check if tokens are expired
isTokenExpired(): boolean

// Clear all tokens
clearTokens(): void
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- AWS Amplify team for the excellent authentication library
- Angular team for the modern framework
- AWS Cognito for secure authentication services

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review AWS Cognito documentation

---

**Happy coding! 🚀**
