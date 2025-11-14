# 🔄 GUÍA: Trabajar en Rork y VPS Simultáneamente

## 📌 El Problema
Estás usando un VPS de Hostinger con PostgreSQL en producción, y necesitas desarrollar en Rork sin conflictos.

## ✅ La Solución
Usar **dos bases de datos diferentes**:
- **Rork (desarrollo)**: SQLite (local)
- **VPS Hostinger (producción)**: PostgreSQL (actual)

---

## 🛠️ CONFIGURACIÓN EN RORK (DESARROLLO)

### ✅ Paso 1: Archivos ya configurados
Estos archivos ya están listos en tu proyecto:
- ✅ `env` - Ya configurado con SQLite
- ✅ `prisma/schema.prisma` - Ya configurado con SQLite
- ✅ `.env.rork` - Respaldo de configuración de desarrollo
- ✅ `prisma/schema.dev.prisma` - Respaldo del schema SQLite

### 🚀 Paso 2: Inicializar la base de datos
Ahora solo necesitas ejecutar estos comandos para que funcione:

**OPCIÓN A: Usando la terminal de Rork aquí abajo** ⬇️

Ejecuta estos comandos UNO POR UNO en la terminal de Rork:

```bash
bunx prisma generate
```

Espera a que termine, luego:

```bash
bunx prisma db push
```

¡Listo! Ya puedes usar la app.

**OPCIÓN B: Comando todo-en-uno**

```bash
bunx prisma generate && bunx prisma db push
```

### ✨ Paso 3: Verificar que funciona
Abre la app en Rork. Deberías ver:
- ✅ Backend conectado a SQLite
- ✅ Puedes registrar un usuario nuevo
- ✅ Puedes crear eventos y datos de prueba
- ✅ Todo funciona localmente SIN necesitar el VPS

---

## 🌐 CONFIGURACIÓN EN TU VPS HOSTINGER (PRODUCCIÓN)

### Paso 1: Descargar archivos de Rork
1. En Rork, descarga estos archivos:
   - `.env.production` (nuevo)
   - `prisma/schema.production.prisma` (nuevo)
   - Cualquier archivo `.tsx` o `.ts` que hayas modificado

### Paso 2: Conectarte a tu VPS
```bash
ssh tu_usuario@tu_servidor.hostinger.com
cd /ruta/a/tu/proyecto
```

### Paso 3: Subir archivos al VPS
**Desde tu computadora local** (NO desde Rork):

```bash
# Subir el archivo .env de producción
scp .env.production tu_usuario@tu_servidor.hostinger.com:/ruta/al/proyecto/.env

# Subir el schema de producción
scp prisma/schema.production.prisma tu_usuario@tu_servidor.hostinger.com:/ruta/al/proyecto/prisma/schema.prisma

# Subir archivos modificados
scp app/auth/login.tsx tu_usuario@tu_servidor.hostinger.com:/ruta/al/proyecto/app/auth/login.tsx
```

### Paso 4: Aplicar cambios en el VPS
**Dentro del VPS** (después de hacer SSH):

```bash
# 1. Verificar que DATABASE_URL es PostgreSQL
cat .env | grep DATABASE_URL
# Debe mostrar: postgresql://...

# 2. Regenerar Prisma Client para PostgreSQL
bunx prisma generate

# 3. Aplicar migraciones (si cambiaste el schema)
bunx prisma migrate deploy
# O si es la primera vez:
bunx prisma db push

# 4. Reiniciar el servidor
pm2 restart all
# o
systemctl restart tu-servicio
```

---

## 🔄 FLUJO DE TRABAJO DIARIO

### Cuando desarrolles en RORK:

1. **Iniciar sesión en Rork**
2. **Trabajar normalmente** - todos los cambios se guardan en SQLite local
3. **Probar funcionalidades** - sin afectar producción
4. **Cuando termines** - copia los cambios al VPS

### Cuando quieras ver cambios en PRODUCCIÓN (VPS):

1. **Descargar archivos modificados de Rork**
   - Descarga los archivos que cambiaste desde Rork
   
2. **Subirlos a tu VPS**
   ```bash
   scp archivo.tsx tu_usuario@tu_servidor.hostinger.com:/ruta/al/proyecto/
   ```

3. **Aplicar en el VPS**
   ```bash
   ssh tu_usuario@tu_servidor.hostinger.com
   cd /ruta/al/proyecto
   
   # Si cambiaste el schema de Prisma:
   bunx prisma generate
   bunx prisma migrate dev --name descripcion_cambio
   
   # Reiniciar servidor
   pm2 restart all
   ```

---

## 📊 SINCRONIZAR DATOS ENTRE RORK Y VPS

### Ver datos de producción en Rork (OPCIONAL)

Si necesitas trabajar con los datos reales de producción en Rork:

```bash
# En tu VPS, exporta los datos
pg_dump -U eventos_user eventos_app > backup.sql

# Descarga el backup
scp tu_usuario@tu_servidor.hostinger.com:backup.sql ./

# En Rork, NO HAGAS ESTO (SQLite no puede importar PostgreSQL directamente)
# En su lugar, usa el VPS para pruebas con datos reales
```

**RECOMENDACIÓN**: Mantén Rork con datos de prueba y usa el VPS para verificar con datos reales.

---

## 🎯 RESUMEN RÁPIDO

| Aspecto | RORK (Desarrollo) | VPS (Producción) |
|---------|-------------------|------------------|
| Base de datos | SQLite (`dev.db`) | PostgreSQL |
| Archivo env | `.env.rork` → `env` | `.env.production` → `.env` |
| Schema Prisma | `schema.dev.prisma` | `schema.prisma` (original) |
| URL Backend | `http://localhost:8081` | `https://api.tickets.reservas.events:8444` |
| Propósito | Desarrollo y pruebas | Producción real |

---

## ⚠️ IMPORTANTE

1. **NUNCA subas** el archivo `dev.db` (SQLite) a tu VPS
2. **NUNCA uses** la DATABASE_URL de producción en Rork
3. **SIEMPRE verifica** qué env estás usando antes de hacer cambios
4. **GUARDA backups** de tu base de datos de producción antes de migraciones

---

## 🚨 TROUBLESHOOTING

### Error: "Prisma Client no coincide con el schema"
```bash
bunx prisma generate
```

### Error: "Database connection failed"
Verifica el archivo `env`:
```bash
cat env | grep DATABASE_URL
```

### ¿Qué base de datos estoy usando?
```bash
# Si ves "file:./dev.db" = SQLite (Rork)
# Si ves "postgresql://" = PostgreSQL (VPS)
cat env | grep DATABASE_URL
```

### Cambié algo en Prisma y no funciona
```bash
# 1. Regenerar cliente
bunx prisma generate

# 2. En desarrollo (Rork):
bunx prisma db push

# 3. En producción (VPS):
bunx prisma migrate deploy
```

---

## 🎉 ¡LISTO!

Ahora puedes:
- ✅ Desarrollar en Rork sin afectar producción
- ✅ Mantener tu VPS funcionando normalmente
- ✅ Sincronizar cambios cuando estén listos
- ✅ Trabajar con ambos entornos simultáneamente
