import {Routes, RouterModule} from '@angular/router'
import {NgModule} from '@angular/core'
import { authGuard } from '../guards/auth.guard'
import { RoleGuard } from '../guards/role.guard'
import { HomeComponent } from './home/home.component'
import { ConsultaiaComponent } from './consultaia/consultaia.component'
import { PagesComponent } from './pages.component'
import { RegistrosfeedComponent } from './registrosfeed/registrosfeed.component'
import { RegistrousersComponent } from './registrousers/registrousers.component'

const routes: Routes =[
 {
    path : '',
     component :PagesComponent,
     children:[
     { 
       path: 'home', 
       component: HomeComponent, 
       canActivate: [ authGuard, RoleGuard ],
       data: { roles: ['Administrador', 'admin'] }
     },
     { 
       path: 'consulta-ia', 
       component: ConsultaiaComponent, 
       canActivate: [ authGuard ]
     },
     { 
       path: 'registrofeedback', 
       component: RegistrosfeedComponent, 
       canActivate: [ authGuard ]
       // Accesible para todos los usuarios autenticados
     },
     { 
       path: 'registrousers', 
       component: RegistrousersComponent, 
       canActivate: [ authGuard, RoleGuard ],
       data: { roles: ['Administrador', 'admin'] }
     },
     { path: '',  component: HomeComponent, canActivate: [ authGuard ] },
     
     ]
   }
]

@NgModule({
 imports: [ RouterModule.forChild( routes )],
 exports:[ RouterModule]
})
export class PagesRoutingModule {}
