# Resultados de Playwright

**Fecha de ejecución:** 13 de octubre de 2026  
**Comando:** `npm run e2e`  
**Proyecto:** Chromium, con la API interceptada por los fixtures de Playwright.

## Resumen

| Resultado | Casos |
| --- | ---: |
| Pasaron | 30 |
| Fallaron | 3 |
| Total | 33 |

La primera ejecución no pudo iniciar porque faltaban las dependencias locales de Playwright y Chromium. Después de ejecutar `npm ci` e instalar Chromium, la suite corrió completa. El código de salida de esa ejecución fue `1`.

## Funcionalidades cubiertas

- **Acceso y registro:** validación de campos, recuperación de contraseña, creación de cuenta y errores de autenticación/registro.
- **Navegación:** rutas públicas, rutas privadas para invitados, redirecciones de sesión, cierre de sesión, JWT vencido y permisos de escritor.
- **Dashboard:** visualización de saldo positivo, saldo cero y error al consultar el saldo.
- **Créditos y planes:** catálogo, reintento ante errores, cierre de modal, cálculo mensual/anual y selección del paquete para el checkout simulado.
- **Retorno de pago:** estados exitoso, rechazado y pendiente, saldo actualizado y acceso a compra de créditos.

Todas las solicitudes a `/api/**` se controlan desde los fixtures. Mercado Pago también se simula; estas pruebas comprueban el comportamiento del frontend y no la autenticación, el registro ni los pagos del backend.

## Casos fallidos en esa ejecución

1. `login comunica credenciales incorrectas y conserva el formulario`: no apareció el mensaje esperado y el botón permaneció en estado de carga.
2. `registro informa que el correo ya está registrado`: no apareció la alerta esperada y el botón permaneció en estado de carga.
3. `resultado pendiente ofrece volver a consultar el saldo`: la prueba esperaba habilitado el botón “Consultar saldo” mientras la consulta inicial todavía estaba en curso; el componente lo mantiene deshabilitado durante esa consulta.

Los otros 30 casos pasaron. Estos resultados describen la ejecución indicada arriba; cualquier cambio en la suite requiere volver a ejecutarla para actualizar el informe.

## Artefactos

Playwright guarda los detalles de fallos, capturas, trazas e informe HTML en `test-results/` y `playwright-report/` (si se generó el informe). Para abrir el último informe, ejecutá `npm run e2e:report`.
