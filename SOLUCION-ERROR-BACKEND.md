# 🔧 Solución al Error "Failed to fetch"

## 🔴 Problema
El error "Failed to fetch" ocurre porque **la base de datos no está configurada**.

## ✅ Solución Rápida (5 minutos)

### Paso 1: Crear una base de datos gratuita en Supabase

1. Ve a **https://supabase.com** y crea una cuenta
2. Haz clic en **"New Project"**
3. Completa los datos:
   - Name: `tickets-app`
   - Database Password: Genera una contraseña segura (guárdala)
   - Region: Elige el más cercano
   - Pricing Plan: **Free**
4. Espera 1-2 minutos mientras se crea el proyecto

### Paso 2: Obtener la URL de conexión

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) en el menú izquierdo
2. Haz clic en **Database**
3. Busca la sección **"Connection string"**
4. Selecciona la pestaña **"Transaction"** (pooler mode)
5. Copia la URL completa que se ve así:
   ```
   postgresql://postgres.xxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
6. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste

### Paso 3: Configurar el archivo .env

1. Abre el archivo `env` en la raíz del proyecto
2. Encuentra la línea que dice `DATABASE_URL=`
3. Reemplázala con tu URL de Supabase:
   ```env
   DATABASE_URL="postgresql://postgres.xxxx:tu-contraseña-aqui@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
   ```

### Paso 4: Generar Prisma Client y ejecutar migraciones

Ejecuta estos comandos en tu terminal:

```bash
# 1. Generar el cliente de Prisma
bunx prisma generate

# 2. Ejecutar las migraciones (crear las tablas)
bunx prisma migrate deploy

# 3. Verificar que todo está bien
bunx prisma db push
```

### Paso 5: Reiniciar el servidor

Si estás usando pm2:
```bash
pm2 restart backend
pm2 logs backend
```

Si estás ejecutando directamente:
```bash
# Detén el servidor actual (Ctrl+C)
# Luego ejecuta:
bun run backend/hono.ts
```

## ✅ Verificación

El servidor debería mostrar:
```
✅ Prisma Client initialized successfully
✅ All systems ready!
```

Y en la app web ya no deberías ver el error "Failed to fetch".

## 🔍 Verificar la conexión

Puedes probar la API directamente en tu navegador:
- https://api.tickets.reservas.events:8444/
- https://api.tickets.reservas.events:8444/api/health

Deberías ver una respuesta JSON con `"status": "ok"` y `"database": "connected"`.

## 🆘 Si todavía no funciona

1. **Verifica CORS**: Asegúrate que en `backend/hono.ts` el origin `'https://tickets.reservas.events'` está en la lista de orígenes permitidos (ya está configurado)

2. **Verifica el puerto**: El backend debe estar corriendo en el puerto 8444

3. **Verifica los logs**: Ejecuta `pm2 logs backend` para ver si hay errores

4. **Problema de SSL/TLS**: Si usas `:8444` en la URL, asegúrate que tu servidor tiene certificado SSL válido para ese puerto

## 📝 Alternativas a Supabase (Gratuitas)

- **Neon**: https://neon.tech (muy rápido, recomendado)
- **Railway**: https://railway.app (incluye despliegue del backend)
- **ElephantSQL**: https://elephantsql.com (opción clásica)

Todas estas opciones te dan una URL de PostgreSQL que puedes usar en `DATABASE_URL`.
