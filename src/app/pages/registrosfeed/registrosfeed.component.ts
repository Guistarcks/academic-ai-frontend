import { Component, OnInit } from '@angular/core';
import { GeminiService } from '../../services/gemini.service';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-registrosfeed',
  templateUrl: './registrosfeed.component.html',
  styleUrl: './registrosfeed.component.css'
})
export class RegistrosfeedComponent implements OnInit {

  name ='';
  gradeInput = 0;
  grades: number[] = [];
  goals = '';
  feedback = '';
  message = '';
  analysisResult = '';
  loading = false;
  typingInterval: any;
  showSaveButtons = false; // Nueva variable para mostrar/ocultar botones

  constructor(
    private geminiService: GeminiService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Cargar el nombre del usuario logueado
    this.cargarNombreUsuario();
  }

  cargarNombreUsuario() {
    // Primero intenta obtener desde localStorage
    const currentUser = this.authService.obtenerUsuarioActual();
    if (currentUser && currentUser.nome) {
      this.name = currentUser.nome;
    } else {
      // Si no está en localStorage, obtener desde la API
      this.authService.obtenerDatosUsuario().subscribe({
        next: (user) => {
          this.name = user.nome || '';
        },
        error: (err) => {
          console.error('Error al cargar datos del usuario:', err);
          this.name = 'Usuario';
        }
      });
    }
  }
 
 gradeInputTimeout: any = null;

onGradeInputChange(value: number) {
  clearTimeout(this.gradeInputTimeout);
  this.gradeInputTimeout = setTimeout(() => {
    if (value >= 0 && value <= 10 && value !== null && value !== undefined) {
      this.grades.push(value);
      this.gradeInput = 0;
    }
  }, 1000); // 1000 ms = 1 segundo
}

  submitData() {
    if (!this.grades.length || !this.goals || !this.feedback) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Por favor, preencha todos os campos antes de enviar.',
        confirmButtonText: 'OK'
      });
      return;
    }

    const inputData = {
      grades: this.grades,
      goals: this.goals,
      feedback: this.feedback
    };

    // Mostrar SweetAlert de loading
    Swal.fire({
      title: '🤖 Analisando com IA',
      html: `
        <div class="text-center">
          <img src="assets/images/ia-book.gif" alt="IA" class="img-fluid mb-3 d-block mx-auto" style="width: 100px;">
          <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Carregando...</span>
          </div>
          <p class="mt-3">A Inteligência Artificial está analisando seus dados...</p>
          <p class="text-muted small">Isso pode levar alguns segundos</p>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.loading = true;

    this.geminiService.analyzeStudentData(inputData).subscribe({
      next: (res) => {
        const text = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Resposta não encontrada.';
        
        // Cerrar el Swal de loading
        Swal.close();
        
        // Iniciar el efecto de escritura
        this.typeText(text);
        
        // Mostrar SweetAlert de éxito
        Swal.fire({
          icon: 'success',
          title: '✅ Análise Concluída!',
          text: 'A análise foi processada com sucesso. Confira os resultados abaixo.',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false
        });

        this.message = 'Análise concluída com sucesso!';
        this.loading = false;
      },
      error: (err) => {
        // Cerrar el Swal de loading
        Swal.close();
        
        // Mostrar SweetAlert de error
        Swal.fire({
          icon: 'error',
          title: '❌ Erro na Análise',
          text: 'Ocorreu um erro ao processar os dados. Tente novamente.',
          confirmButtonText: 'OK'
        });

        this.message = 'Erro ao analisar os dados.';
        this.loading = false;
        console.error('Erro na análise:', err);
      }
    });
  }
 typeText(text: string) {
  this.analysisResult = '';
  let i = 0;
  clearInterval(this.typingInterval); // Asegura que no haya otra animación corriendo

  this.typingInterval = setInterval(() => {
    if (i < text.length) {
      this.analysisResult += text.charAt(i);
      i++;
    } else {
      clearInterval(this.typingInterval); // Detiene al final
      // Mostrar botones cuando termine la animación
      this.showSaveButtons = true;
      // Ocultar el cursor después de terminar
      setTimeout(() => {
        const cursor = document.querySelector('.typing-cursor') as HTMLElement;
        if (cursor) cursor.style.display = 'none';
      }, 500);
    }
  }, 25); // Ajusta la velocidad aquí (25ms = rápido)
}

guardarAnalisis() {
  // Validar que tengamos todos los datos necesarios
  if (!this.name || !this.goals || !this.feedback || !this.analysisResult) {
    Swal.fire({
      icon: 'warning',
      title: 'Dados Incompletos',
      text: 'Por favor, preencha todos os campos antes de guardar.',
      confirmButtonText: 'OK'
    });
    return;
  }

  const historico = {
    nome: this.name,
    metas: this.goals,
    feedback: this.feedback,
    analysisResult: this.analysisResult,
    data_creacao: new Date().toISOString().slice(0, 10)
  };

  // Mostrar loading
  Swal.fire({
    title: 'Guardando...',
    text: 'Por favor, aguarde.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

  this.authService.guardarHistorico(historico).subscribe({
    next: (response) => {
      Swal.fire({
        icon: 'success',
        title: '✅ Guardado com Sucesso!',
        text: 'O histórico foi guardado na base de dados.',
        timer: 2500,
        timerProgressBar: true,
        showConfirmButton: false
      });

      // Limpiar el formulario después de guardar
      this.limpiarFormulario();
    },
    error: (err) => {
      Swal.fire({
        icon: 'error',
        title: '❌ Erro ao Guardar',
        text: 'Ocorreu um erro ao guardar o histórico. Tente novamente.',
        confirmButtonText: 'OK'
      });
      console.error('Error al guardar histórico:', err);
    }
  });
}

cancelarAnalisis() {
  Swal.fire({
    title: '¿Cancelar Análise?',
    text: 'Os dados não serão guardados. Tem certeza?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sim, Cancelar',
    cancelButtonText: 'Não',
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6'
  }).then((result) => {
    if (result.isConfirmed) {
      this.limpiarFormulario();
      Swal.fire({
        icon: 'info',
        title: 'Cancelado',
        text: 'A análise foi cancelada.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  });
}

limpiarFormulario() {
  // NO limpiamos el name porque es el usuario logueado
  // this.name = ''; // <-- Comentado para mantener el nombre del usuario
  this.grades = [];
  this.gradeInput = 0;
  this.goals = '';
  this.feedback = '';
  this.analysisResult = '';
  this.message = '';
  this.showSaveButtons = false;
  
  // Mostrar el cursor nuevamente
  const cursor = document.querySelector('.typing-cursor') as HTMLElement;
  if (cursor) cursor.style.display = 'inline';
} 
}

