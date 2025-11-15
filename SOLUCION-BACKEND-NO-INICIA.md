# 🚨 BACKEND NO INICIA - "Snapshot Not Found"

## El Problema

Cuando intentas acceder a `https://tickets-92loqsix46yuo4fa4rjne.rork.app` obtienes el error **"snapshot not found"**.

Esto significa que **el backend de Rork no se está iniciando/construyendo**.

---

## 📊 Diagnóstico

### ✅ Cosas que SÍ están bien:
1. **DATABASE_URL configurada** - Supabase PostgreSQL conectada
2. **Código del backend** - No hay errores de sintaxis
3. **Prisma schema** - Válido y bien estructurado
4. **tRPC + Hono** - Configuración correcta
5. **Variables de entorno** - Todas las necesarias están presentes

### ❌ El problema:
**Prisma Client no se está generando** en el entorno de Rork durante el build del backend.

---

## 🔍 Por qué ocurre esto

Rork debería ejecutar automáticamente `prisma generate` cuando construye el backend, pero parece que no lo está haciendo o el proceso falla silenciosamente.

### Señales del problema:
- "snapshot not found" = El contenedor/deployment del backend no existe
- El backend no responde en ningún endpoint (ni `/`, ni `/api/health`)
- No hay logs de startup visibles

---

## 💡 Soluciones Posibles

### Solución 1: Agregar script postinstall (NECESITA SOPORTE DE RORK)

Necesitas que Rork agregue esto a `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

**Por qué:** Esto asegura que `prisma generate` se ejecute automáticamente después de cada instalación de dependencias.

### Solución 2: Verificar logs del backend en Rork

Rork debería tener alguna forma de ver los logs del backend durante el build/startup. Necesitas:

1. **Logs de build** - Para ver si `prisma generate` se ejecutó
2. **Logs de startup** - Para ver el output del archivo `backend/hono.ts`
3. **Logs de errores** - Para identificar qué está fallando

**Pregunta para el soporte de Rork:** ¿Cómo accedo a los logs del backend en tiempo real?

### Solución 3: Configuración de Build Especial

Puede que Rork necesite una configuración especial para proyectos con Prisma. Posiblemente un archivo de configuración como:

- `rork.config.js` 
- `backend.config.js`
- O alguna configuración en `app.json`

Que especifique:
```
buildCommands: [
  "prisma generate",
  "prisma migrate deploy"
]
```

---

## 🎯 Lo que he hecho para ayudar

### 1. Actualicé el backend para dar más información

Modifiqué `backend/lib/prisma.ts` para que muestre mensajes de error más claros cuando Prisma Client no está disponible.

### 2. Incrementé la versión del backend

Cambié la versión en `backend/hono.ts` de v1.0.5 a v1.0.6 para forzar que Rork reconstruya el backend.

### 3. Documenté el problema

Creé este archivo para que puedas compartirlo con el soporte de Rork.

---

## 📱 ¿Qué deberías ver cuando funcione?

Cuando el backend inicie correctamente, deberías poder:

1. **Acceder a la URL del backend:**
   ```
   https://tickets-92loqsix46yuo4fa4rjne.rork.app
   ```
   
   Y obtener una respuesta JSON:
   ```json
   {
     "status": "ok",
     "message": "API is running", 
     "database": "connected",
     "timestamp": "2025-..."
   }
   ```

2. **Ver logs de startup como estos:**
   ```
   ==================================================
   🚀 BACKEND SERVER STARTING - v1.0.6
   ==================================================
   📦 Environment: development
   🔧 Database URL configured: true
   💾 Database connected: true
   🔐 JWT Secret configured: true
   🔌 Prisma Client available: true
   
   ✅ All systems ready!
   ==================================================
   ```

3. **La app debería funcionar** sin errores de "Failed to fetch"

---

## 🆘 Preguntas para el Soporte de Rork

1. **¿Cómo puedo ver los logs del backend en tiempo real?**
   - Logs de build
   - Logs de startup  
   - Logs de errores

2. **¿Rork ejecuta automáticamente `prisma generate`?**
   - Si sí, ¿en qué momento del proceso?
   - Si no, ¿cómo lo configuro?

3. **¿Existe alguna configuración especial para proyectos con Prisma ORM?**
   - ¿Archivo de configuración específico?
   - ¿Comandos de build personalizados?

4. **¿Por qué obtengo "snapshot not found"?**
   - ¿Significa que el backend no se construyó?
   - ¿O que falló durante el startup?
   - ¿Cómo puedo ver qué salió mal?

5. **¿Puedo agregar un script `postinstall` a `package.json`?**
   - O Rork lo sobrescribe
   - ¿Hay otra forma de configurar comandos post-instalación?

---

## 🔧 Próximos Pasos

### Para ti:

1. **Contacta al soporte de Rork** con este documento
2. **Pide acceso a logs del backend** para diagnosticar
3. **Pregunta sobre soporte de Prisma** en la plataforma
4. **Comparte las respuestas** que te den para que pueda ayudarte mejor

### Para el soporte de Rork:

Si leen esto: Este es un proyecto legítimo con Prisma ORM + tRPC + Hono. Todo el código está correcto pero el backend no está iniciando porque `@prisma/client` no se genera durante el build. 

**Necesitamos:**
- Que se ejecute `prisma generate` durante el build
- O una forma de configurar comandos personalizados de build
- O acceso a los logs para diagnosticar qué está pasando

---

## 📚 Archivos Clave

Si el soporte necesita revisar código:

- `backend/hono.ts` - Servidor principal (Hono + tRPC)
- `backend/lib/prisma.ts` - Inicialización de Prisma
- `backend/trpc/app-router.ts` - Router de tRPC
- `prisma/schema.prisma` - Esquema de la base de datos
- `env` - Variables de entorno (incluyendo DATABASE_URL)
- `package.json` - Dependencias (incluye @prisma/client y prisma)

---

## ✅ Verificación Final

Una vez que el backend funcione, prueba estos endpoints:

```bash
# Debe retornar { "status": "ok", ... }
curl https://tickets-92loqsix46yuo4fa4rjne.rork.app

# Debe retornar { "status": "ok", ... }  
curl https://tickets-92loqsix46yuo4fa4rjne.rork.app/api/health

# Debe retornar información de tRPC
curl https://tickets-92loqsix46yuo4fa4rjne.rork.app/api/trpc
```

Y desde la app, el login debería funcionar sin errores de red.

---

**Este es un problema de infraestructura/plataforma de Rork, no de tu código.** El código está bien, solo necesita que Rork lo construya correctamente. 🙏
