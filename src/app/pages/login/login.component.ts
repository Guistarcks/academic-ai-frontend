import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserModel } from 'src/app/models/usuario.model';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
 usuario: UserModel = new UserModel()
 lembrar =false;
 timerInterval: any;

 constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {

    //Consulto si existe en local Storage el mail
    const email = localStorage.getItem('email');
    if(email){this.usuario.email = email; this.lembrar= true}
  }

  login(form :NgForm){
  if( form.invalid) {return;}

  Swal.fire({
    allowOutsideClick: false,
    icon: "info",
    text: 'Espere por favor...'
  });
   Swal.showLoading();
  
  
Swal.fire({
  title: 'Logueando na plataforma',
  html: 'Processando.....<b></b> milliseconds.',
  timer: 2000,
  timerProgressBar: true,
  didOpen: () => {
    Swal.showLoading();

    const popup = Swal.getPopup();
    const timerElement = popup ? popup.querySelector('b') : null;

    if (timerElement) {
      this.timerInterval = setInterval(() => {
        const timeLeft = Swal.getTimerLeft();
        if (timeLeft !== undefined && timeLeft !== null) {
          timerElement.textContent = `${timeLeft}`;
        }
      }, 100);
    }
  },
  willClose: () => {
    clearInterval(this.timerInterval);
  }
}).then((result) => {
  if (result.dismiss === Swal.DismissReason.timer) {
    console.log('I was closed by the timer');
    
    this.auth.login(this.usuario).subscribe({
      next: (resp) => {
        console.log('Login exitoso:', resp);
        
        if (this.lembrar) {
          localStorage.setItem('email', this.usuario.email);
        }
        
        // Obtener datos del usuario después del login
        this.auth.obtenerDatosUsuario().subscribe({
          next: (user) => {
            console.log('Datos del usuario obtenidos:', user);
            Swal.close();
            
            // Redirigir según el rol del usuario
            const userRole = user.rol?.toLowerCase() || '';
            if (userRole.includes('admin')) {
              console.log('✅ Usuario Admin - Redirigiendo a /home');
              this.router.navigateByUrl('/home');
            } else {
              console.log('✅ Usuario normal - Redirigiendo a /registrofeedback');
              this.router.navigateByUrl('/registrofeedback');
            }
          },
          error: (err) => {
            console.error('Error al obtener datos del usuario:', err);
            // Continuar de todos modos con redirección por defecto
            Swal.close();
            this.router.navigateByUrl('/home');
          }
        });
      },
      error: (err) => {
        console.error('Error en login:', err);
        Swal.fire({
          icon: "error",
          title: "Erro no login",
          text: err.error?.message || 'Erro ao fazer login. Verifique suas credenciais.'
        });
      }
    });
  }
});


  }

}
