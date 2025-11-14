# ⚡ INICIO RÁPIDO - Configuración Rork + VPS

## 🎯 Lo que necesitas saber
- **Rork (aquí)**: Usa SQLite (base de datos local)
- **VPS Hostinger**: Usa PostgreSQL (tu base actual)

Ya está todo configurado. Solo necesitas ejecutar 2 comandos.

---

## 🚀 COMANDO PARA USAR RORK AHORA MISMO

Abre la terminal aquí abajo y ejecuta:

```bash
bunx prisma generate && bunx prisma db push
```

**¡Eso es todo!** Ya puedes:
- ✅ Registrar un usuario nuevo
- ✅ Crear eventos
- ✅ Probar funcionalidades
- ✅ Desarrollar sin afectar tu VPS

---

## 📤 Para subir cambios a tu VPS

1. **Descarga los archivos** que modificaste de Rork
2. **Sube al VPS** con `scp` o FileZilla
3. **En el VPS ejecuta**:
   ```bash
   bunx prisma generate
   pm2 restart all
   ```

---

## 📖 Más información
Lee `GUIA-RORK-VPS.md` para instrucciones detalladas.
