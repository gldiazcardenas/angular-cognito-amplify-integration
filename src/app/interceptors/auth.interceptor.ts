import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, from } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // Always get fresh token from Amplify (async)
  return from(authService.getAccessTokenAsync()).pipe(
    switchMap(accessToken => {
      // Add auth header if we have a token
      if (accessToken) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`
          }
        });
      }

      return next(request).pipe(
        catchError((error: HttpErrorResponse) => {
          // Handle 401 Unauthorized errors
          if (error.status === 401) {
            console.log('Received 401 error, attempting token refresh...');
            
            // Try to refresh the token and retry the request (Amplify handles this automatically)
            return from(authService.getAccessTokenAsync()).pipe(
              switchMap(newAccessToken => {
                if (newAccessToken) {
                  console.log('Token refreshed successfully, retrying request...');
                  // Retry the request with the new token
                  return next(request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newAccessToken}`
                    }
                  }));
                } else {
                  console.error('Failed to refresh token, redirecting to login...');
                  // If refresh fails, redirect to login
                  authService.logout();
                  return throwError(() => error);
                }
              }),
              catchError(refreshError => {
                console.error('Error during token refresh:', refreshError);
                // If refresh fails, redirect to login
                authService.logout();
                return throwError(() => error);
              })
            );
          }
          
          // For other errors, just pass them through
          return throwError(() => error);
        })
      );
    })
  );
};
