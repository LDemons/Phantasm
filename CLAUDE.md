# Instrucciones del proyecto

## Uso de RTK
Este proyecto se trabaja en Windows nativo, por lo que RTK NO reescribe comandos automáticamente.
Debes usar RTK explícitamente en los comandos de terminal siempre que exista soporte.

### Regla general
Prefiere siempre comandos con `rtk` delante.

### Ejemplos
- `rtk git status`
- `rtk git diff`
- `rtk git add -A`
- `rtk git commit`
- `rtk npm test`
- `rtk npm install`
- `rtk read <archivo>`
- `rtk grep "<texto>" <ruta>`
- `rtk find "<patron>" <ruta>`

### Regla importante
No uses `Read`, `Grep` o `Glob` si necesitas beneficiarte de RTK.
Prefiere `rtk read`, `rtk grep`, `rtk find`, o comandos shell equivalentes.

### Flujo esperado
Antes de ejecutar cualquier comando, revisa si existe una variante con RTK y úsala por defecto.