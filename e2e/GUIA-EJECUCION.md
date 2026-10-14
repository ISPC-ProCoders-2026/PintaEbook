# Guía para ejecutar Playwright

## Requisitos

- Node.js y npm instalados.
- Ejecutar los comandos desde la carpeta `PintaEbook`.
- La primera vez, instalar las dependencias y el navegador Chromium de Playwright.

## Preparación inicial

```powershell
npm ci
npx playwright install chromium
```

`npm ci` instala las versiones registradas en `package-lock.json`. `playwright.config.ts` levanta Angular automáticamente en `http://127.0.0.1:4207`; no hace falta iniciar el servidor aparte. Ese puerto debe estar libre.

## Ejecutar las pruebas

Suite completa:

```powershell
npm run e2e
```

Ejecutar un archivo o un caso específico:

```powershell
npx playwright test e2e/authentication.spec.ts
npx playwright test e2e/billing-result.spec.ts
npx playwright test --grep "registro envía los datos válidos"
```

Modos útiles:

```powershell
npm run e2e:headed   # Mostrar Chromium durante las pruebas
npm run e2e:ui       # Abrir el modo interactivo de Playwright
npm run e2e:report   # Abrir el informe HTML más reciente
npx tsc -p e2e/tsconfig.json  # Comprobar tipos de los archivos e2e
```

## Qué hace la suite

Playwright inicia y detiene el servidor de desarrollo. Las pruebas usan mocks aislados por caso para responder a `/api/**`; no requieren levantar el backend ni conectarse a Mercado Pago. El checkout externo se sustituye por una página simulada.

Al fallar un caso, Playwright conserva capturas y trazas en `test-results/`. El informe HTML se genera en `playwright-report/`; ambos directorios son artefactos locales de ejecución.
