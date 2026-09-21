# PintaEbook — Frontend

Frontend de **PintaEbook**, una aplicación web orientada a la creación y gestión de ebooks. El frontend está desarrollado como una **Single Page Application (SPA)** utilizando **Angular**.

## Tecnologías

- Angular 21.2.x
- TypeScript 5.9.2
- Tailwind CSS 4.3.3
- PostCSS 8.5.26
- RxJS 7.8.x
- Vitest 4.0.8
- Prettier 3.8.1
- npm 11.10.0

El proyecto utiliza componentes **standalone** de Angular y el builder `@angular/build:application`.

## Arquitectura

La aplicación utiliza una arquitectura basada en componentes standalone y una organización por funcionalidades.

- Las rutas se encuentran definidas en `src/app/app.routes.ts` y permiten acceder a las distintas páginas de la aplicación.
- La comunicación con el backend se encuentra encapsulada en servicios.
  - Actualmente, el servicio de autenticación se encuentra en: `src/app/service/login/login.ts`
  - Los modelos utilizados para la autenticación se encuentran en: `src/app/models/auth.model.ts`
- Los componentes reutilizables de la interfaz se encuentran dentro de: `src/app/shared/components/`
  - Actualmente se utilizan componentes compartidos como **Navbar** y **Footer**.

## Estructura del proyecto

```
src/
│
├── index.html
├── main.ts
├── styles.css
│
├── environments/
│   └── environment.generated.ts
│
└── app/
    │
    ├── app.config.ts
    ├── app.css
    ├── app.html
    ├── app.routes.ts
    ├── app.spec.ts
    ├── app.ts
    │
    ├── models/
    │   └── auth.model.ts
    │
    ├── pages/
    │   ├── about/
    │   ├── dashboard/
    │   ├── home/
    │   ├── login/
    │   ├── not-found/
        ├── credits/
    │   └── register/
    │
    ├── service/
    │   └── login/
    │       ├── login.spec.ts
    │       └── login.ts
    │
    └── shared/
        └── components/
            ├── footer/
            ├── cta/
            ├── faqs/
            ├── progress-bar/
            └── navbar/
```

Los recursos estáticos del proyecto se encuentran en `public/`.

## Vistas

El frontend cuenta actualmente con las siguientes vistas:

- **Home**: página principal de la aplicación.
- **Login**: inicio de sesión mediante formulario.
- **Register**: registro de usuarios.
- **Dashboard**: panel principal del usuario.
- **About**: información sobre el proyecto.
- **Credits**: Creditos y faqs del proyecto.
- **Not Found**: página de error 404.

Las vistas se encuentran organizadas dentro de `src/app/pages/`.

## Componentes compartidos

El proyecto cuenta con componentes reutilizables ubicados en: `src/app/shared/components/`

Entre ellos se encuentran:

- Navbar
- Footer
- Cta
- Progress-bar
- Faqs


## Instalación y ejecución

La forma recomendada de levantar el proyecto desde cero es utilizar Docker. Esto evita problemas de dependencias y deja preparado el entorno de desarrollo.

### Requisitos previos

- Docker Desktop instalado y en ejecución.
- Git instalado.
- El backend disponible en `http://localhost:8000/` para utilizar el login, el registro y el resto de las funciones conectadas a la API.

### Opción 1: ejecutar con Docker

#### 1. Clonar el repositorio

```bash
git clone https://github.com/ISPC-ProCoders-2026/PintaEbook.git
cd PintaEbook
```

#### 2. Configurar las variables de entorno

Crea el archivo `.env` a partir del archivo de ejemplo incluido en el proyecto.

**Windows (PowerShell/CMD):**

```powershell
copy .env.example .env
```

**Linux/macOS:**

```bash
cp .env.example .env
```

Abre el archivo `.env` y verifica que contenga los valores correctos:

```env
API_BASE_URL=http://localhost:8000/api
GOOGLE_CLIENT_ID=1042090144205-hs489ota4otsl2f0e2l8qtk27ktegu5h.apps.googleusercontent.com
```

#### 3. Construir y levantar el contenedor

Con Docker Desktop abierto, ejecuta:

```bash
docker compose up -d --build
```

Durante la construcción, un script lee el archivo `.env` y genera automáticamente `src/environments/environment.generated.ts`.

#### 4. Acceder a la aplicación

Cuando el contenedor esté listo, abre [http://localhost:4200](http://localhost:4200) en el navegador.

> **Importante:** el backend también debe estar levantado en [http://localhost:8000](http://localhost:8000) para que funcionen correctamente el login, el registro y las demás funciones que utilizan la API.

### Opción 2: ejecutar en local

Si las dependencias ya están instaladas, puedes iniciar el servidor de desarrollo con:

```bash
npm start
```

Este comando genera automáticamente la configuración del entorno y luego inicia el servidor de Angular. No es necesario ejecutar manualmente el script de generación del entorno.

La aplicación estará disponible en [http://localhost:4200](http://localhost:4200).


## Recursos

Los recursos visuales y archivos estáticos se encuentran en: `public/`

Actualmente incluye recursos utilizados por la interfaz, como logotipos e imágenes y videos utilizados en la página Home.

## Proyecto

PintaEbook forma parte del proyecto académico **FullStack II** de la **Tecnicatura Superior en Desarrollo de Software** del **ISPC**.

El frontend se desarrolla de manera independiente del backend y se comunica con este mediante una API REST.
