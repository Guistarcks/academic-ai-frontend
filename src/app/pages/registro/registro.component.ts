import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';

import { UserModel } from 'src/app/models/usuario.model';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.css']
})
export class RegistroComponent implements OnInit {

  usuario: UserModel = new UserModel()
  lembrar =false;
  timerInterval: any;

  constructor( private auth:AuthService, 
               private router:Router) { }

  ngOnInit() {}

   onSubmit( form:NgForm){
    if( form.invalid) {return;}
    
Swal.fire({
  title: 'Realizando o Cadastro',
  html: 'Processando.... <b></b> milliseconds.',
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
      this.auth.registrarUsuarios(this.usuario)
    .subscribe( resp =>{
      console.log(resp);
     Swal.close();
     if( this.lembrar){
      localStorage.setItem('email', this.usuario.email);
    }
      
     this.router.navigateByUrl('/home');

    }, (err) =>{
      console.log(err);
      
      let errorMessage = 'Error en el proceso de registro';
      
      // Manejo de errores específicos
      if (err.error && err.error.error && err.error.error.message) {
        // Error de Firebase
        const firebaseError = err.error.error.message;
        if (firebaseError.includes('EMAIL_EXISTS')) {
          errorMessage = 'El email ya está registrado en Firebase';
        } else if (firebaseError.includes('WEAK_PASSWORD')) {
          errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        } else if (firebaseError.includes('INVALID_EMAIL')) {
          errorMessage = 'El formato del email no es válido';
        } else {
          errorMessage = firebaseError;
        }
      } else if (err.error && err.error.message) {
        // Error de la API Flask
        errorMessage = err.error.message;
      } else if (err.status === 409) {
        errorMessage = 'El email ya está registrado en la base de datos';
      }

      Swal.fire({
            icon: "error",
            title: "Oops... Error en el proceso de registro",
            text: errorMessage
           });
    });
  }
});
}}
