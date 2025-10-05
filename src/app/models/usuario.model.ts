export class UserModel {
  id?: number;
  email: string;
  password: string;
  nome: string;
  rol: string;
  data_creacao?: string;

  constructor(
    email: string = '', 
    password: string = '', 
    nome: string = '', 
    rol: string = 'user',
    id?: number,
    data_creacao?: string
  ) {
    this.email = email;
    this.password = password;
    this.nome = nome;
    this.rol = rol;
    this.id = id;
    this.data_creacao = data_creacao;
  }
}
