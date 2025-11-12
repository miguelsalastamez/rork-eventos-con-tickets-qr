# 🗄️ Configuración de Base de Datos para Rork

## ⚠️ IMPORTANTE: El backend requiere una base de datos

Tu aplicación necesita una base de datos PostgreSQL para funcionar. Actualmente ves el error **"404 Not Found"** o **"Server did not start"** porque la base de datos no está configurada.

## 🚀 Solución Rápida (5 minutos)

### Opción 1: Supabase (Recomendado - Gratis)

1. **Crea una cuenta** en [Supabase](https://supabase.com)

2. **Crea un nuevo proyecto**
   - Dale un nombre a tu proyecto
   - Elige una región cercana a ti
   - Crea una contraseña fuerte (guárdala)

3. **Obtén tu Connection String**
   - Ve a **Settings** (⚙️) → **Database**
   - Busca **Connection string** 
   - Selecciona el modo **Session pooler** o **Direct connection**
   - Copia el connection string que se ve así:
     ```
     postgresql://postgres.xxxxx:[TU-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
     ```
   - **IMPORTANTE**: Reemplaza `[TU-PASSWORD]` con la contraseña que creaste

4. **Configura el proyecto en Rork**
   - Edita el archivo `.env` en tu proyecto
   - Pega tu connection string en `DATABASE_URL`:
     ```
     DATABASE_URL="postgresql://postgres.xxxxx:tu-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
     ```

5. **Inicializa la base de datos**
   - En Rork, abre la terminal y ejecuta:
     ```bash
     bunx prisma generate
     bunx prisma migrate deploy
     ```

6. **¡Listo!** - Recarga tu aplicación y el backend debería funcionar

---

### Opción 2: Neon (Gratis)

1. Crea cuenta en [Neon](https://neon.tech)
2. Crea un nuevo proyecto
3. Copia el **Connection String** desde el dashboard
4. Pégalo en `.env` como `DATABASE_URL`
5. Ejecuta:
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   ```

---

### Opción 3: Railway (Gratis con límites)

1. Crea cuenta en [Railway](https://railway.app)
2. Crea nuevo proyecto → Add **PostgreSQL**
3. Click en PostgreSQL → **Connect** → Copia el **DATABASE_URL**
4. Pégalo en `.env`
5. Ejecuta:
   ```bash
   bunx prisma generate
   bunx prisma migrate deploy
   ```

---

## 🔍 Verificar que todo funciona

Después de configurar, verifica:

1. **En la terminal de Rork:**
   ```bash
   node check-backend.js
   ```
   
2. **Deberías ver:**
   ```
   ✅ DATABASE_URL configurado
   ✅ Cliente de Prisma generado
   ✅ Todo configurado correctamente!
   ```

3. **Recarga tu aplicación** - Los errores deberían desaparecer

---

## ❓ ¿Por qué necesito esto?

Tu aplicación almacena:
- 👥 Usuarios y autenticación
- 🎫 Eventos y tickets
- 🏆 Sorteos y premios
- 💬 Mensajes
- 📊 Y más...

Todo esto necesita una base de datos para funcionar. Sin ella, el backend no puede iniciar.

---

## 🆘 ¿Problemas?

### Error: "Cannot find module '@prisma/client'"
```bash
bunx prisma generate
```

### Error: "The table does not exist"
```bash
bunx prisma migrate deploy
```

### Error: "Can't reach database server"
- Verifica que copiaste correctamente el connection string
- Asegúrate de reemplazar `[PASSWORD]` con tu contraseña real
- Verifica que no haya espacios extra al principio o final

---

## 💰 Costos

**Todas las opciones tienen planes gratuitos generosos:**

- **Supabase**: 500MB gratis, más que suficiente para empezar
- **Neon**: 10GB gratis
- **Railway**: $5 de crédito gratis mensual

Para una app nueva, el plan gratuito funcionará perfectamente.

---

## 📝 Archivo .env Ejemplo

```env
# Pega tu connection string de Supabase/Neon/Railway aquí
DATABASE_URL="postgresql://user:password@host:5432/database"

# Genera uno seguro con: openssl rand -base64 32
JWT_SECRET="rork-secure-jwt-secret-2024-change-in-production"

# No cambies esto - es la URL correcta para Rork
EXPO_PUBLIC_RORK_API_BASE_URL="https://rork.app/p/92loqsix46yuo4fa4rjne"

EXPO_PUBLIC_TOOLKIT_URL="https://toolkit.rork.com"

PORT=8081
NODE_ENV=production
```

---

¿Necesitas más ayuda? Consulta [BACKEND-TROUBLESHOOTING.md](./BACKEND-TROUBLESHOOTING.md)
