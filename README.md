# Academic-AI 


## Requisitos para ejecutar tu aplicación:
Angular versión 14.2.x.
Angular CLI versión 14.2 : npm install -g @angular/cli@14.2.0
## Node.js: Preferiblemente la versión 16.x o 14.x
(Angular 14 no es totalmente compatible con Node 18+ en algunos casos).
## Una vez instalada la Cli ejecutar ng version
 
- ng serve --o


## Para ejecutar el backend con flask es necesario seguir la documentación

https://flask.palletsprojects.com/en/stable/installation/#virtual-environments



Pasos detallados:
Abre Talend API Tester: Inicia la aplicación o la herramienta del API Tester dentro de Talend. 
Crea una nueva petición: Si aún no tienes una, crea una nueva petición. 
Selecciona el método HTTP: Elige el método (GET, POST, etc.) que corresponda a la API que estás utilizando. 
Ve a la sección HEADERS: Busca el área designada para los encabezados de la solicitud. 
Añade el encabezado Authorization:
Haz clic en el botón "Add header" o similar para agregar un nuevo encabezado. 
En el campo de nombre, escribe Authorization. 
En el campo de valor, ingresa `Bearer ` seguido de tu token de acceso. Por ejemplo: Bearer tu_token_secreto_aqui. Asegúrate de incluir un espacio entre "Bearer" y tu token. 
Haz clic en Send: Una vez configurado, presiona el botón "Send" para enviar tu petición. 