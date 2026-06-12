# PintaEbook - Frontend SPA & Arquitectura Frontend

Este repositorio contiene el código fuente de la aplicación cliente (**Single Page Application - SPA**) de la plataforma **PintaEbook**, desarrollada bajo una arquitectura horizontal estricta utilizando **Angular 20+**, **TypeScript** y **Bootstrap**.

---

## Principios de Diseño Arquitectónico

El núcleo de la aplicación se basa en un desacoplamiento explícito entre capas y dependencias unidireccionales, garantizando escalabilidad, mantenibilidad y facilidad de evolución frente a cambios futuros en el backend o integraciones externas.

### Desacoplamiento HTTP

Las páginas y componentes de presentación nunca consumen directamente `HttpClient`. Todo acceso a recursos externos es delegado a la capa de servicios.

### Inyección Transparente

La URL base de la API REST se suministra mediante un `InjectionToken` configurado desde los archivos de entorno (`environments`), evitando dependencias rígidas dentro de los servicios.

### Contrato Explícito

Las interfaces TypeScript representan el único contrato formal de datos entre Frontend y Backend, permitiendo validaciones en tiempo de compilación y reduciendo inconsistencias.

---

## Arquitectura Horizontal

La SPA está organizada en capas claramente diferenciadas.

| Capa | Componente / Archivo Clave | Responsabilidad |
|--------|--------------------------|----------------|
| **Navegador** | `index.html`, `styles.css` | Punto de entrada de la aplicación. Renderizado del lado cliente (CSR) e importación global de Bootstrap. |
| **Enrutador** | `app.routes.ts` | Gestión de navegación, rutas, redirecciones y captura de rutas inexistentes mediante wildcard (`**`). |
| **Transversales** | `auth.guard.ts`, `api-base-url.interceptor.ts` | Servicios transversales para autenticación y modificación automática de peticiones HTTP. |
| **Pages** | `/pages/*` | Componentes contenedores (*Smart Components*) asociados a rutas específicas. Implementan carga diferida (*Lazy Loading*). |
| **Componentes** | `/components/*` | Componentes reutilizables de presentación (*Dumb Components*), sin lógica de negocio. |
| **Servicios** | `/services/*` | Lógica de negocio, manejo de estado, Signals, Observables RxJS y comunicación con el backend. |
| **Modelos** | `/models/*` | Interfaces y tipos TypeScript que representan las estructuras de datos intercambiadas con el backend. |
| **Infraestructura** | `HttpClient`, `REST API` | Mecanismo de transporte y consumo de endpoints HTTP. |

---

## Flujo de Datos

El flujo de información sigue una arquitectura unidireccional:

```text
[Page / Component]
          │
          ▼
[Service (Signal / Observable)]
          │
          ▼
      [HttpClient]
          │
          ▼
 [API Base URL Interceptor]
          │
          ▼
      [REST Backend]
```

La respuesta retorna siguiendo el mismo recorrido en sentido inverso:

```text
[REST Backend]
          │
          ▼
      [HttpClient]
          │
          ▼
        [Service]
          │
          ▼
 [Page / Component]
          │
          ▼
    Actualización UI
```

---

## Estructura del Proyecto

```text
src/
│
├── app/
│   ├── pages/
│   │   ├── home/
│   │   ├── login/
│   │   ├── ebooks/
│   │   └── ...
│   │
│   ├── components/
│   │   ├── navbar/
│   │   ├── ebook-card/
│   │   └── ...
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── ebook.service.ts
│   │   └── ...
│   │
│   ├── models/
│   │   ├── ebook.model.ts
│   │   ├── user.model.ts
│   │   └── ...
│   │
│   ├── guards/
│   │   └── auth.guard.ts
│   │
│   ├── interceptors/
│   │   └── api-base-url.interceptor.ts
│   │
│   └── app.routes.ts
│
├── environments/
│   ├── environment.ts
│   └── environment.prod.ts
│
├── index.html
└── styles.css
```

---

## Tecnologías Utilizadas

- Angular 20+
- TypeScript
- Bootstrap
- RxJS
- Angular Signals
- REST API
- JWT Authentication

---

## Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/ISPC-ProCoders-2026/PintaEbook.git
cd pintaebook-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Editar los archivos ubicados en:

```text
src/environments/
```

y establecer la URL correspondiente del backend.

Ejemplo:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api'
};
```

---

## Ejecución en Desarrollo

Iniciar el servidor local:

```bash
ng serve
```

La aplicación quedará disponible en:

```text
http://localhost:4200
```

---

## Consideraciones de Arquitectura

- Los componentes no consumen APIs directamente.
- Toda la lógica de negocio reside en los servicios.
- Las interfaces TypeScript son la única fuente de verdad para los modelos de datos.
- El acceso a rutas privadas se controla mediante Guards.
- La URL de la API es inyectada automáticamente por Interceptors.
- La aplicación favorece el uso de Signals y RxJS para la gestión reactiva del estado.

---

## Integración con Backend

La SPA está diseñada para consumir una API REST desarrollada en:

- Django
- Django REST Framework
- JWT Authentication

Toda comunicación se realiza mediante HTTP utilizando servicios especializados y tipado estricto.

---

## Autor

Proyecto desarrollado para la plataforma **PintaEbook** siguiendo principios de arquitectura frontend escalable, mantenible y desacoplada.
