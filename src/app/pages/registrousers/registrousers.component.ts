import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserModel } from 'src/app/models/usuario.model';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-registrousers',
  templateUrl: './registrousers.component.html',
  styleUrl: './registrousers.component.css'
})
export class RegistrousersComponent implements OnInit {

  usuario: UserModel = new UserModel();
  users: UserModel[] = [];
  loading: boolean = false;
  error: string = '';
  timerInterval: any;
  
  // Variables para modo edición
  isEditing: boolean = false;
  editingUserId: number | null = null;

  constructor(private auth: AuthService) { }

  ngOnInit() {
    // Inicializar con rol por defecto
    this.usuario.rol = 'user';
    // Cargar la lista de usuarios
    this.cargarUsuarios();
  }

  // Cargar todos los usuarios
  cargarUsuarios() {
    this.loading = true;
    this.error = '';
    
    this.auth.gettodosUsers().subscribe({
      next: (usuarios) => {
        this.users = usuarios;
        this.loading = false;
        console.log('Usuarios cargados:', usuarios);
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.error = 'Error al cargar la lista de usuarios';
        this.loading = false;
      }
    });
  }

  // Método para cambiar el rol desde el dropdown
  selectRol(rol: string) {
    this.usuario.rol = rol;
  }

  // Método para enviar el formulario
  onSubmit(form: NgForm) {
    if (form.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor, completa todos los campos requeridos'
      });
      return;
    }

    // Mostrar loading
    Swal.fire({
      title: 'Cadastrando Usuario',
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
        
        if (this.isEditing && this.editingUserId) {
          // Modo EDICIÓN
          this.auth.actualizarUsuario(this.editingUserId, this.usuario)
            .subscribe({
              next: (resp) => {
                console.log('Usuario actualizado exitosamente:', resp);
                
                Swal.fire({
                  icon: 'success',
                  title: '¡Usuario Actualizado!',
                  text: `Usuario ${this.usuario.nome} actualizado exitosamente`,
                  confirmButtonText: 'OK'
                });

                // Recargar la lista de usuarios
                this.cargarUsuarios();
                
                // Limpiar el formulario y resetear modo edición
                form.resetForm();
                this.usuario = new UserModel();
                this.usuario.rol = 'user';
                this.isEditing = false;
                this.editingUserId = null;
              },
              error: (err) => {
                console.error('Error al actualizar usuario:', err);
                
                let errorMessage = 'Error al actualizar el usuario';
                
                if (err.error && err.error.message) {
                  errorMessage = err.error.message;
                } else if (err.status === 409) {
                  errorMessage = 'El email ya está registrado por otro usuario';
                } else if (err.status === 404) {
                  errorMessage = 'Usuario no encontrado';
                }

                Swal.fire({
                  icon: 'error',
                  title: 'Oops... Error al actualizar',
                  text: errorMessage
                });
              }
            });
        } else {
          // Modo CREACIÓN (código original)
          this.auth.registrarUsuarioParaAdmin(this.usuario)
            .subscribe({
              next: (resp) => {
                console.log('Usuario registrado exitosamente:', resp);
                
                Swal.fire({
                  icon: 'success',
                  title: '¡Usuario Cadastrado!',
                  text: `Usuario ${this.usuario.nome} registrado exitosamente`,
                  confirmButtonText: 'OK'
                });

                // Recargar la lista de usuarios
                this.cargarUsuarios();

                // Limpiar el formulario
                form.resetForm();
                this.usuario = new UserModel();
                this.usuario.rol = 'user';
              },
              error: (err) => {
                console.error('Error al registrar usuario:', err);
                
                let errorMessage = 'Error en el proceso de registro';
                
                if (err.error && err.error.message) {
                  errorMessage = err.error.message;
                } else if (err.status === 409) {
                  errorMessage = 'El email ya está registrado';
                } else if (err.status === 400) {
                  errorMessage = 'Datos inválidos o incompletos';
                } else if (err.status === 401) {
                  errorMessage = 'No tienes permiso para realizar esta acción';
                }

                Swal.fire({
                  icon: 'error',
                  title: 'Oops... Error al cadastrar',
                  text: errorMessage
                });
              }
            });
        }
      }
    });
  }

  // Método para editar un usuario
  editarUsuario(user: UserModel) {
    this.isEditing = true;
    this.editingUserId = user.id ?? null;
    
    // Cargar datos del usuario en el formulario
    this.usuario.nome = user.nome;
    this.usuario.email = user.email;
    this.usuario.rol = user.rol;
    this.usuario.password = ''; // No mostramos la password actual
    
    // Scroll hacia el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    Swal.fire({
      icon: 'info',
      title: 'Modo Edición',
      text: 'Modifica los datos y presiona "Actualizar"',
      timer: 2000,
      showConfirmButton: false
    });
  }

  // Método para cancelar edición
  cancelarEdicion(form: NgForm) {
    this.isEditing = false;
    this.editingUserId = null;
    form.resetForm();
    this.usuario = new UserModel();
    this.usuario.rol = 'user';
  }

  // Método para eliminar un usuario
  eliminarUsuario(user: UserModel) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas eliminar al usuario ${user.nome}? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Mostrar loading
        Swal.fire({
          title: 'Eliminando...',
          text: 'Por favor espera',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        this.auth.eliminarUsuario(user.id!).subscribe({
          next: (resp) => {
            console.log('Usuario eliminado:', resp);
            
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'El usuario ha sido eliminado exitosamente',
              timer: 2000,
              showConfirmButton: false
            });

            // Recargar la lista de usuarios
            this.cargarUsuarios();
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            
            let errorMessage = 'Error al eliminar el usuario';
            if (err.error && err.error.message) {
              errorMessage = err.error.message;
            }

            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMessage
            });
          }
        });
      }
    });
  }
}
