# ⚠️ CONFIGURACIÓN REQUERIDA - LEE ESTO PRIMERO

## 🔴 Problema: Error "Failed to fetch"

Si ves este error, es porque **la base de datos no está configurada**.

## ✅ Solución (5 minutos)

### Opción 1: Usar una base de datos cloud GRATIS (Recomendado)

Lee el archivo **[SOLUCION-ERROR-BACKEND.md](./SOLUCION-ERROR-BACKEND.md)** que tiene instrucciones paso a paso con capturas de pantalla.

**Resumen rápido:**
1. Crear cuenta gratis en https://supabase.com
2. Crear un proyecto nuevo
3. Copiar la URL de conexión (Settings > Database > Connection string)
4. Pegar la URL en el archivo `env` en la línea `DATABASE_URL=`
5. Ejecutar:
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   ```
6. Reiniciar el servidor

### Opción 2: Usar PostgreSQL local

Si tienes PostgreSQL instalado localmente:

1. Crea una base de datos:
   ```bash
   createdb tickets
   ```

2. Configura el archivo `env`:
   ```env
   DATABASE_URL="postgresql://postgres:tu_password@localhost:5432/tickets?schema=public"
   ```

3. Ejecuta las migraciones:
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   ```

## 📋 Checklist de verificación

✅ Archivo `env` tiene `DATABASE_URL` configurado (no vacío)  
✅ Ejecutaste `bunx prisma generate`  
✅ Ejecutaste `bunx prisma migrate deploy`  
✅ El servidor backend está corriendo (puerto 8444)  
✅ Al abrir https://api.tickets.reservas.events:8444/api/health ves `"database": "connected"`

## 🆘 ¿Todavía tienes problemas?

Lee el archivo completo: **[SOLUCION-ERROR-BACKEND.md](./SOLUCION-ERROR-BACKEND.md)**

O revisa los archivos de documentación:
- [BACKEND-STATUS.md](./BACKEND-STATUS.md) - Estado del backend
- [BACKEND-TROUBLESHOOTING.md](./BACKEND-TROUBLESHOOTING.md) - Solución de problemas
- [DATABASE-SETUP-RORK.md](./DATABASE-SETUP-RORK.md) - Configuración de base de datos

## 💡 ¿Por qué necesito una base de datos?

Esta app es un sistema completo de venta de tickets y gestión de eventos que incluye:
- Autenticación de usuarios
- Creación y gestión de eventos
- Venta de tickets
- Check-in con QR codes
- Sistema de rifas y sorteos
- Mensajería
- Y mucho más

Todo esto requiere una base de datos para almacenar la información de forma segura.

## 🚀 Opciones de base de datos gratuitas

Todas estas opciones ofrecen planes gratuitos generosos:

1. **Supabase** (Recomendado) - https://supabase.com
   - 500 MB de base de datos gratis
   - Muy fácil de configurar
   - Incluye autenticación y storage

2. **Neon** - https://neon.tech
   - 3 GB gratis
   - Muy rápido
   - Escala automáticamente

3. **Railway** - https://railway.app
   - $5 de crédito gratis mensual
   - Incluye despliegue del backend

4. **ElephantSQL** - https://elephantsql.com
   - 20 MB gratis
   - Opción clásica y confiable
