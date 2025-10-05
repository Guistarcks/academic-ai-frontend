import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    
    // Endpoints públicos que NO requieren token de Flask
    const publicEndpoints = [
      '/api/login',    // Login público
      '/api/users'     // Registro público (solo POST)
    ];

    // APIs externas que NO deben recibir el token de Flask
    const externalAPIs = [
      'generativelanguage.googleapis.com',  // Gemini API
      'identitytoolkit.googleapis.com',     // Firebase Auth (si se usa)
      'firebaseio.com'                      // Firebase Realtime DB (si se usa)
    ];

    // Verificar si es una API externa
    const isExternalAPI = externalAPIs.some(api => request.url.includes(api));

    // Verificar si es un endpoint público
    const isPublic = publicEndpoints.some(endpoint => 
      request.url.includes(endpoint) && (request.method === 'POST')
    );
    
    // Si NO es público Y NO es API externa, agregar el token JWT de Flask
    if (!isPublic && !isExternalAPI) {
      const token = localStorage.getItem('token');
      
      if (token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log('✅ Token Flask agregado a:', request.url);
      } else {
        console.warn('⚠️ No hay token disponible para:', request.url);
      }
    } else if (isExternalAPI) {
      console.log('🌐 API externa (sin token Flask):', request.url);
    }

    // Manejar errores de autenticación
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Solo redirigir al login si es error de nuestra API (no APIs externas)
        if (error.status === 401 && !isExternalAPI) {
          console.warn('❌ Error de autenticación 401. Redirigiendo al login...');
          localStorage.removeItem('token');
          localStorage.removeItem('expira');
          localStorage.removeItem('currentUser');
          this.router.navigateByUrl('/login');
        }
        return throwError(() => error);
      })
    );
  }
}
