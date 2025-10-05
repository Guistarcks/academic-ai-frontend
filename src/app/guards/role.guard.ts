import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar si está autenticado primero
    if (!this.auth.estaAutenticado()) {
      this.router.navigateByUrl('/login');
      return false;
    }

    // Obtener el rol del usuario actual
    const usuario = this.auth.obtenerUsuarioActual();
    const userRole = usuario?.rol?.toLowerCase() || '';

    // Obtener los roles permitidos desde la configuración de la ruta
    const allowedRoles = route.data['roles'] as string[] || [];

    // Si no hay roles especificados, permitir acceso
    if (allowedRoles.length === 0) {
      return true;
    }

    // Verificar si el rol del usuario está en los roles permitidos
    const hasAccess = allowedRoles.some(role => 
      role.toLowerCase() === userRole || 
      userRole.includes(role.toLowerCase())
    );

    if (hasAccess) {
      console.log('✅ Acceso permitido para rol:', userRole);
      return true;
    } else {
      console.warn('❌ Acceso denegado. Rol:', userRole, 'Roles permitidos:', allowedRoles);
      
      // Redirigir según el rol
      if (userRole.includes('admin')) {
        this.router.navigateByUrl('/home');
      } else {
        this.router.navigateByUrl('/registrofeedback');
      }
      
      return false;
    }
  }
}
