import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  usuarioActual: any = null;
  isAdmin: boolean = false;
  isUser: boolean = false;

  constructor(private auth: AuthService) {}

  ngOnInit() {
    this.cargarRolUsuario();
  }

  cargarRolUsuario() {
    this.usuarioActual = this.auth.obtenerUsuarioActual();
    
    if (this.usuarioActual) {
      const rol = this.usuarioActual.rol?.toLowerCase() || '';
      this.isAdmin = rol.includes('admin');
      this.isUser = !this.isAdmin; // Si no es admin, es usuario normal
      
      console.log('Rol del usuario:', rol, '| isAdmin:', this.isAdmin, '| isUser:', this.isUser);
    } else {
      // Intentar obtener desde la API
      this.auth.obtenerDatosUsuario().subscribe({
        next: (user) => {
          this.usuarioActual = user;
          const rol = user.rol?.toLowerCase() || '';
          this.isAdmin = rol.includes('admin');
          this.isUser = !this.isAdmin;
          
          console.log('Rol del usuario (desde API):', rol, '| isAdmin:', this.isAdmin, '| isUser:', this.isUser);
        },
        error: (err) => {
          console.error('Error al obtener rol del usuario:', err);
        }
      });
    }
  }
}
