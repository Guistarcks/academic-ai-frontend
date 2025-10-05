import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UserModel } from '../models/usuario.model';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Interfaz para la respuesta de login de Flask
interface FlaskLoginResponse {
  token: string;
}

// Interfaz para la respuesta de registro
interface FlaskRegisterResponse {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // URL del backend Flask
  private urlbackend = environment.urlbackend;
  userToken: string = '';

  constructor(private http: HttpClient) {
    this.leerToken();
  }

  // Método logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('expira');
    localStorage.removeItem('currentUser');
    this.userToken = '';
  }

  // Guardar datos del usuario actual
  guardarUsuarioActual(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  // Obtener datos del usuario actual desde localStorage
  obtenerUsuarioActual(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  // Obtener datos del usuario actual desde la API
  obtenerDatosUsuario(): Observable<any> {
    return this.http.get(`${this.urlbackend}api/me`).pipe(
      tap(user => this.guardarUsuarioActual(user))
    );
  }

  // Método para realizar el login usando Flask API
  login(usuario: UserModel): Observable<FlaskLoginResponse> {
    const loginData = {
      email: usuario.email,
      password: usuario.password
    };

    return this.http.post<FlaskLoginResponse>(
      `${this.urlbackend}api/login`,
      loginData
    ).pipe(
      map(resp => {
        this.guardarToken(resp.token);
        return resp;
      }),
      catchError(err => {
        console.error('Error en login:', err);
        return throwError(() => err);
      })
    );
  }

  // Método para registrar usuario (auto-registro público)
  registrarUsuarios(usuario: UserModel): Observable<any> {
    const userData = {
      email: usuario.email,
      password: usuario.password,
      nome: usuario.nome,
      rol: usuario.rol || 'user',
      data_creacao: new Date().toISOString().slice(0, 10)
    };

    return this.http.post<FlaskRegisterResponse>(
      `${this.urlbackend}api/users`,
      userData
    ).pipe(
      tap(() => console.log('Usuario registrado en la base de datos')),
      catchError(err => {
        console.error('Error durante el registro:', err);
        return throwError(() => err);
      })
    );
  }

  // Método para que administradores registren usuarios
  registrarUsuarioParaAdmin(usuario: UserModel): Observable<any> {
    const userData = {
      email: usuario.email,
      password: usuario.password,
      nome: usuario.nome,
      rol: usuario.rol || 'user',
      data_creacao: new Date().toISOString().slice(0, 10)
    };

    return this.http.post<FlaskRegisterResponse>(
      `${this.urlbackend}api/users`,
      userData
    ).pipe(
      tap(() => console.log('Usuario registrado por admin')),
      catchError(err => {
        console.error('Error durante el registro por admin:', err);
        return throwError(() => err);
      })
    );
  }

  // Guardar token JWT de Flask
  private guardarToken(token: string) {
    this.userToken = token;
    localStorage.setItem('token', token);

    // Token expira en 8 horas (según configuración de Flask)
    const expira = new Date();
    expira.setHours(expira.getHours() + 8);
    localStorage.setItem('expira', expira.getTime().toString());
  }

  // Leer token del localStorage
  leerToken(): string {
    this.userToken = localStorage.getItem('token') ?? '';
    return this.userToken;
  }

  // Comprobar si el usuario está autenticado
  estaAutenticado(): boolean {
    if (this.userToken.length < 2) {
      return false;
    }

    const expira = Number(localStorage.getItem('expira'));
    const expiraData = new Date();
    expiraData.setTime(expira);

    if (expiraData > new Date()) {
      return true;
    } else {
      return false;
    }
  }

  // Obtener todos los usuarios (requiere autenticación)
  gettodosUsers(): Observable<UserModel[]> {
    return this.http.get<UserModel[]>(`${this.urlbackend}api/users`);
  }

  // Actualizar un usuario (requiere autenticación)
  actualizarUsuario(userId: number, usuario: UserModel): Observable<any> {
    const userData: any = {
      email: usuario.email,
      nome: usuario.nome,
      rol: usuario.rol
    };

    // Solo incluir password si se proporcionó una nueva
    if (usuario.password && usuario.password.trim()) {
      userData.password = usuario.password;
    }

    return this.http.put(`${this.urlbackend}api/users/${userId}`, userData).pipe(
      tap(() => console.log('Usuario actualizado exitosamente')),
      catchError(err => {
        console.error('Error al actualizar usuario:', err);
        return throwError(() => err);
      })
    );
  }

  // Eliminar un usuario (requiere autenticación)
  eliminarUsuario(userId: number): Observable<any> {
    return this.http.delete(`${this.urlbackend}api/users/${userId}`).pipe(
      tap(() => console.log('Usuario eliminado exitosamente')),
      catchError(err => {
        console.error('Error al eliminar usuario:', err);
        return throwError(() => err);
      })
    );
  }

  // Guardar un histórico de análisis (requiere autenticación)
  guardarHistorico(historico: any): Observable<any> {
    return this.http.post(`${this.urlbackend}api/historicos`, historico).pipe(
      tap(() => console.log('Histórico guardado exitosamente')),
      catchError(err => {
        console.error('Error al guardar histórico:', err);
        return throwError(() => err);
      })
    );
  }

  // Obtener todos los históricos (requiere autenticación)
  obtenerHistoricos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.urlbackend}api/historicos`).pipe(
      catchError(err => {
        console.error('Error al obtener históricos:', err);
        return throwError(() => err);
      })
    );
  }
}
