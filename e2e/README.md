# Pruebas del frontend con Playwright

Suite en TypeScript con Page Object Model (POM), ejecutada en Chromium real.
No necesita backend: las llamadas a `/api/**` se interceptan con datos controlados.
Los endpoints no contemplados hacen fallar la prueba. Mercado Pago se reemplaza
por una página de checkout simulada; no se realizan pagos.

Desde la carpeta `PintaEbook`:

```sh
npm install
npx playwright install chromium
npm run e2e
```

Playwright inicia y detiene Angular en `http://127.0.0.1:4207` y configura la API
para ese servidor. El puerto debe estar libre. El archivo de entorno generado
se regenera con tu configuración habitual al ejecutar nuevamente `npm start`.

```sh
npm run e2e:headed   # Ver el navegador durante la ejecución
npm run e2e:ui       # Interfaz interactiva de Playwright
npm run e2e:report   # Abrir el último informe HTML
npx tsc -p e2e/tsconfig.json
```

## Cobertura

- Navegación pública: inicio, nosotros, créditos y registro.
- Rutas privadas: redirección de invitados, login, biblioteca, recarga y logout.
- Redirección de usuarios autenticados desde login/registro, JWT vencido y
  restricciones de secciones administrativas para escritores.
- Dashboard: saldo positivo, cero y consulta fallida.
- Créditos: catálogo, cierre por botón/Escape, reintento y checkout simulado.
- Planes: precios mensual/anual, plan gratis, paquete elegido para Escritor y
  Editorial, errores de checkout y paquete ausente.
- Planes públicos: cambio de precios y redirección al login para comprar.

`pages.ts` concentra las interacciones con la interfaz y `fixtures.ts` controla
los mocks, aislados por prueba. Las pruebas verifican comportamiento del frontend;
no validan autenticación real del servidor ni procesamiento de pagos.

Se guardan informe HTML, capturas y trazas de fallos en carpetas excluidas de Git.
Documentación: [servidor de pruebas](https://playwright.dev/docs/test-webserver)
y [simulación de APIs](https://playwright.dev/docs/mock).
