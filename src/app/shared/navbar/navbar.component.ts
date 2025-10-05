import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  
  usuarioActual: any = null;
  nombreUsuario: string = '';

  constructor( private auth:AuthService,
               private router:Router){}

  ngOnInit() {
    this.cargarDatosUsuario();
  }

  // Cargar datos del usuario actual
  cargarDatosUsuario() {
    // Primero intentar obtener desde localStorage
    this.usuarioActual = this.auth.obtenerUsuarioActual();
    
    if (this.usuarioActual) {
      this.nombreUsuario = this.usuarioActual.nome || this.usuarioActual.email;
    } else {
      // Si no hay datos en localStorage, obtenerlos de la API
      this.auth.obtenerDatosUsuario().subscribe({
        next: (user) => {
          this.usuarioActual = user;
          this.nombreUsuario = user.nome || user.email;
        },
        error: (err) => {
          console.error('Error al obtener datos del usuario:', err);
          this.nombreUsuario = 'Usuario';
        }
      });
    }
  }

  //Metodo salir, destruimos el token, y redireccionamos al login. 
  sair(){
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

}
