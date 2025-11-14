# 🔥 Guía Rápida: Backend en Rork

## ✅ ¿Qué acabo de arreglar?

### Problema que tenías:
- El frontend intentaba conectarse a `localhost:8081` ❌
- En Rork, el backend se gestiona automáticamente en una URL específica
- Esto causaba el error "Failed to fetch"

### Solución aplicada:
- ✅ Cambié `EXPO_PUBLIC_RORK_API_BASE_URL` en el archivo `env`
- ✅ Ahora apunta a: `https://tickets-92loqsix46yuo4fa4rjne.rork.app`
- ✅ Esta es la URL del backend que Rork gestiona automáticamente

---

## 🔄 ¿Cómo "resetear" el backend en Rork?

En Rork, **NO necesitas resetear el backend manualmente**. Rork lo gestiona por ti.

### Cuando necesites que Rork recargue el backend:
Simplemente **guarda cualquier archivo del backend** (como `backend/hono.ts`) y Rork lo reiniciará automáticamente.

---

## 🗄️ Base de Datos Supabase

Tu configuración actual:
- ✅ Usas Supabase para desarrollo en Rork
- ✅ Connection string configurada correctamente
- ✅ Las tablas se crean automáticamente cuando el backend se inicia

### ¿Necesitas recrear las tablas?

Si las tablas no se crearon o hay problemas, Rork debería ejecutar automáticamente las migraciones cuando se inicia el backend. Si algo sale mal:

1. Verifica que el archivo `env` tenga la `DATABASE_URL` correcta
2. Verifica que las tablas existan en Supabase (https://supabase.com → tu proyecto → Table Editor)

---

## 🚀 Tu Configuración Actual

### Para Desarrollo en Rork:
```env
EXPO_PUBLIC_RORK_API_BASE_URL="https://tickets-92loqsix46yuo4fa4rjne.rork.app"
DATABASE_URL="postgresql://postgres:Bi0i19c%233salas@db.qaiaigeskomvqvcvgobo.supabase.co:5432/postgres"
```

### Para Producción en tu VPS:
Cuando hagas el build final, cambia en tu servidor a:
```env
EXPO_PUBLIC_RORK_API_BASE_URL="https://api.tickets.reservas.events:8444"
DATABASE_URL="tu_database_url_del_vps"
```

---

## 🔍 Verificar que todo funciona

1. **Verifica la conexión al backend:**
   - Abre la app en Rork
   - Deberías ver que el login funciona sin errores "Failed to fetch"

2. **Si ves errores de autenticación (401):**
   - Es normal si no has iniciado sesión
   - Intenta registrarte o iniciar sesión

3. **Si ves "Failed to fetch" o errores de red:**
   - Verifica que el archivo `env` tenga la URL correcta
   - Guarda cualquier archivo del backend para forzar un reinicio

---

## 📝 Resumen de URLs

| Entorno | Frontend | Backend | Base de Datos |
|---------|----------|---------|---------------|
| **Rork (Desarrollo)** | Auto | `https://tickets-92loqsix46yuo4fa4rjne.rork.app` | Supabase |
| **VPS (Producción)** | `https://tickets.reservas.events` | `https://api.tickets.reservas.events:8444` | VPS PostgreSQL |

---

## ⚡ Comandos Útiles (cuando salgas de Rork)

Cuando trabajes en tu VPS o localmente:

```bash
# Generar Prisma Client
bunx prisma generate

# Crear/aplicar migraciones
bunx prisma migrate dev

# Ver la base de datos
bunx prisma studio
```

**IMPORTANTE:** En Rork NO necesitas ejecutar estos comandos. Rork los ejecuta automáticamente.

---

## 🆘 ¿Problemas?

### Error: "Failed to fetch"
- ✅ Verifica que `EXPO_PUBLIC_RORK_API_BASE_URL` en `env` sea `https://tickets-92loqsix46yuo4fa4rjne.rork.app`
- ✅ Guarda un archivo del backend para reiniciarlo

### Error: 401 Unauthorized
- ✅ Es normal, solo necesitas iniciar sesión

### Error: "Database error"
- ✅ Verifica que `DATABASE_URL` esté correcta en el archivo `env`
- ✅ Verifica que las tablas existan en Supabase

---

**¡Todo listo!** Tu backend debería funcionar ahora. 🎉
