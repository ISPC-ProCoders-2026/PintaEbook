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
- **Not Found**: página de error 404.

Las vistas se encuentran organizadas dentro de `src/app/pages/`.

## Componentes compartidos

El proyecto cuenta con componentes reutilizables ubicados en: `src/app/shared/components/`

Entre ellos se encuentran:

- Navbar
- Footer




## Instalación

### 1. Clonar el repositorio

```bash
git clone ISPC-ProCoders-2026/PintaEbook.git
cd PintaEbook
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar el proyecto

```bash
npm start
```

El comando `npm start` genera automáticamente la configuración del entorno y luego inicia el servidor de desarrollo de Angular.

La aplicación estará disponible en: [http://localhost:4200](http://localhost:4200)

> No es necesario ejecutar manualmente el script de generación del entorno.



## Recursos

Los recursos visuales y archivos estáticos se encuentran en: `public/`

Actualmente incluye recursos utilizados por la interfaz, como logotipos e imágenes y videos utilizados en la página Home.

## Proyecto

PintaEbook forma parte del proyecto académico **FullStack II** de la **Tecnicatura Superior en Desarrollo de Software** del **ISPC**.

El frontend se desarrolla de manera independiente del backend y se comunica con este mediante una API REST.
