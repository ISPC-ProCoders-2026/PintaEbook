# Pruebas del frontend: ejecución por funcionalidad

Esta guía permite ejecutar las 25 pruebas de Playwright por funcionalidad y
obtener evidencias para la wiki del proyecto. La suite utiliza TypeScript y
Page Object Model (POM) en Chromium real. Las respuestas de la API y el checkout
se simulan: no requiere backend y no realiza pagos reales.

## Preparación

Abrir una terminal PowerShell en el proyecto:

```powershell
cd C:\Users\rocii\Desktop\script\proCoders\task\PintaEbook
```

Si las dependencias o el navegador todavía no están instalados:

```powershell
npm install
npx playwright install chromium
```

Playwright inicia Angular automáticamente en `http://127.0.0.1:4207`.
Mantener ese puerto libre. Los siguientes comandos muestran el navegador y
ejecutan una prueba a la vez mediante `--workers=1`.

## 1. Navegación pública — 1 prueba

Verifica la navegación desde el menú hacia Sobre Nosotros, Créditos y Registro.

```powershell
npm run e2e:headed -- --grep "navegación pública" --workers=1
```

Evidencias sugeridas: menú público, página de créditos y pantalla de registro.

## 2. Navegación privada y autenticación — 13 pruebas

Verifica:

- Redirección de invitados al login desde siete rutas privadas.
- Login, acceso a Mis Ebooks, recarga, regreso al dashboard y logout.
- Redirección al dashboard desde login y registro con una sesión activa.
- Eliminación de una sesión con JWT vencido.
- Restricción de las secciones metrics y purchases para escritores.

```powershell
npm run e2e:headed -- e2e/navigation.spec.ts --grep-invert "navegación pública" --workers=1
```

Para dividir este grupo en escenarios más pequeños:

```powershell
# Protección de rutas: 7 pruebas
npm run e2e:headed -- --grep "invitado: protege" --workers=1

# Login, biblioteca y logout: 1 prueba
npm run e2e:headed -- --grep "login, biblioteca, regreso y cierre de sesión" --workers=1

# Usuario con sesión activa: 2 pruebas
npm run e2e:headed -- --grep "usuario autenticado sale de" --workers=1

# Sesión vencida: 1 prueba
npm run e2e:headed -- --grep "JWT vencido" --workers=1

# Restricciones administrativas: 2 pruebas
npm run e2e:headed -- --grep "escritor no puede entrar" --workers=1
```

Evidencias sugeridas: redirección al login, biblioteca privada, dashboard y
resultado de las pruebas de restricciones.

## 3. Saldo de créditos del dashboard — 3 pruebas

Verifica saldo positivo (275), saldo cero y consulta fallida. Cuando la consulta
falla se muestra `—`, sin presentar el saldo como cero.

```powershell
npm run e2e:headed -- --grep "dashboard muestra saldo|saldo no disponible" --workers=1
```

Para ejecutar cada escenario:

```powershell
npm run e2e:headed -- --grep "dashboard muestra saldo 275" --workers=1
npm run e2e:headed -- --grep "dashboard muestra saldo 0" --workers=1
npm run e2e:headed -- --grep "saldo no disponible" --workers=1
```

Evidencias sugeridas: tarjeta de créditos con 275, con 0 y con `—`.

## 4. Compra de créditos — 3 pruebas

Verifica catálogo de paquetes, cierre/reapertura del modal, cierre con Escape,
reintento tras un error del catálogo y redirección a un checkout simulado.

```powershell
npm run e2e:headed -- --grep "catálogo|compra de créditos" --workers=1
```

Para ejecutar cada escenario:

```powershell
npm run e2e:headed -- --grep "catálogo, cierre y reapertura" --workers=1
npm run e2e:headed -- --grep "error de catálogo" --workers=1
npm run e2e:headed -- --grep "compra de créditos redirige" --workers=1
```

Evidencias sugeridas: modal con tres paquetes, error con opción de actualizar
catálogo y pantalla «Checkout simulado».

## 5. Planes — 5 pruebas

Verifica precios mensual/anual, cierre al elegir el plan gratuito, selección del
paquete correspondiente a Escritor y Editorial, manejo del error de pago,
paquete ausente y redirección al login al comprar desde los planes públicos.

```powershell
npm run e2e:headed -- --grep "planes cambian|plan Escritor|plan Editorial|plan sin paquete|planes públicos" --workers=1
```

Para ejecutar cada escenario:

```powershell
npm run e2e:headed -- --grep "planes cambian" --workers=1
npm run e2e:headed -- --grep "plan Escritor" --workers=1
npm run e2e:headed -- --grep "plan Editorial" --workers=1
npm run e2e:headed -- --grep "plan sin paquete" --workers=1
npm run e2e:headed -- --grep "planes públicos" --workers=1
```

Evidencias sugeridas: planes mensuales, precios anuales, mensaje de error de pago
y mensaje de paquete no disponible.

## Obtener capturas con tiempo para revisar

### Interfaz interactiva

El navegador de `e2e:headed` se cierra al terminar cada prueba. Para revisar cada
paso después de ejecutarlo, abrir la interfaz interactiva:

```powershell
npm run e2e:ui
```

1. Seleccionar una prueba de la lista.
2. Ejecutarla.
3. Seleccionar el paso deseado en la línea de tiempo.
4. Revisar la instantánea del navegador y tomar una captura con la herramienta
   de capturas del sistema.

También se puede abrir la interfaz filtrada por funcionalidad:

```powershell
npm run e2e:ui -- --grep "navegación pública"
npm run e2e:ui -- e2e/navigation.spec.ts --grep-invert "navegación pública"
npm run e2e:ui -- --grep "dashboard muestra saldo|saldo no disponible"
npm run e2e:ui -- --grep "catálogo|compra de créditos"
npm run e2e:ui -- --grep "planes cambian|plan Escritor|plan Editorial|plan sin paquete|planes públicos"
```

### Depuración paso a paso en el navegador

Para pausar y avanzar por las acciones de una prueba concreta:

```powershell
npm run e2e -- --debug --grep "catálogo, cierre y reapertura"
```

Usar el Inspector de Playwright para avanzar paso a paso y tomar la captura
cuando el navegador muestre el estado deseado. Reemplazar el filtro por el
nombre del escenario que se quiera documentar.

## Informe de resultados

```powershell
npm run e2e:report
```

El informe HTML corresponde a la última ejecución. Si se ejecutan grupos por
separado, tomar o guardar la evidencia de cada grupo antes de ejecutar el
siguiente. La configuración guarda capturas y trazas automáticamente cuando una
prueba falla; para evidencias de pruebas exitosas utilizar la interfaz
interactiva o la depuración.

Para ejecutar todas las pruebas y obtener un informe completo:

```powershell
npm run e2e -- --workers=1
```

## Plantilla de evidencia para la wiki

Copiar este bloque para cada funcionalidad y completar los resultados de la
ejecución propia:

```markdown
### Funcionalidad: [nombre]

- Alcance: frontend Angular con API y checkout simulados.
- Escenario: [comportamiento verificado].
- Comando: [comando utilizado].
- Resultado esperado: [estado de la interfaz o redirección].
- Resultado obtenido: [resultado observado].
- Fecha de ejecución: [fecha].
- Evidencia: [adjuntar captura de la interfaz y/o del resultado del test].
```
