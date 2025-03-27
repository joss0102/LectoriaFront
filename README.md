# Proyecto Lectoria
 
Este proyecto consiste en el desarrollo de una página web interactiva para la gestión y seguimiento de lecturas. La plataforma permite a los usuarios registrar los libros que han leído, gestionar sus lecturas en curso y planificar futuras lecturas mediante una lista de deseos. Además, los usuarios pueden agregar información detallada como fechas de inicio y finalización, imágenes de las portadas, puntuaciones, etc.

Para mejorar la experiencia, el sistema ofrece estadísticas de lecturas, proporcionando datos visuales sobre la cantidad de libros leídos por meses o años, tendencias de géneros, hábitos de lectura y otras métricas relevantes. La interfaz será intuitiva y fácil de utilizar para actualizar y eliminar las lecturas.

El objetivo principal de esta aplicación es brindar a los usuarios una herramienta centralizada donde puedan organizar y analizar su actividad lectura de manera eficiente y visualmente atractiva.

### Funcionalidades

- [x] Creacion carpetas
- [x] Creacion componentes base
- [ ] Modo dia/noche (default noche)
- [ ] Subir pdf y leerlo
  - [ ] Buscar en api el libro y enseñar los datos

# 🏗️ Apartados de la Página Web ( ir ✅ a cada componente que vayamos terminando )

- **Componentes generales**

  - **Nav superior**: `Nav con elementos generales`
    - Menu desplegable, inicio, biblioteca, buscador, notificaciones, modo noche/dia y logo
  - **Nav Izquierdo**: `Nav con elemtnos mas concretos`
    - Logo usuario, nombre usuario, lectura actual, estadisticas, calificaciones, pendientes y ajustes

- **Paginas generales con link**

  - **Home**: `Página principal Con carrusel de las portadas de los libros`
    - Datos del libro, imagenes de la saga del libro, carrusel de libros
  - **Biblioteca**: `Página Donde se muestran diferentes datos de los libros`
    - Ultimos libros leidos, recien añadidos y autores mas leidos
  - **Lectura actual**: `Página que muestra datos de la lectura actual del usuario`
    - Portada, datos generales, datos mas especificos, progreso en forma de grafico.
  - **Estadisticas**: `Página donde se muestran diferentes graficos con estadisticas de lectura`
    - Libros leidos en total, en fisico y electronico. Botones de mas datos. Diferentes graficos
  - **Calificaciones**: `Página principal con información general y navegación hacia otras secciones.`
  - **Pendientes**: `Página principal con información general y navegación hacia otras secciones.`
  - **Ajustes**: `Página principal con información general y navegación hacia otras secciones.`



# Trabajo en equipo (subir y actualizar código)

- Pasos para mergear, orden:

```git
1️⃣ RamaDavid / RamaJose → 2️⃣ mergeDavid-Jose → 3️⃣ main
```
- 1️⃣ Subir los cambios de tu rama RamaDavid / ramaJose ,comitear y pushear a tu rama. ( no hace falta utilizar comandos , se puede utilizar la UI de VSCODE )
```git
git add .
git commit -m "Descripción del cambio"
git push origin RamaDavid/Jose
```

- 2️⃣ Crear un Pull Request para fusionar RamaDavid / RamaJose en mergeDavid-Jose:
  - New Pull Request en Pull Request de GitHub
  - En el desplegable "base", selecciona la rama mergeDavid-Jose (la rama donde se va a hacer la fusión).
  - En el desplegable "compare", selecciona la rama RamaDavid o RamaJose.
  - GitHub mostrará los cambios que se van a fusionar. Verifica que los cambios son correctos.
  - Si todo está correcto, haz clic en "Create Pull Request".
  - Resolver conflictos (si los hay) y eliminar <<<<<<< HEAD apartir de ====== son la rama tuya eliminar las marcas de conflictos y quedarnos con el codigo que queramos.
  - Una vez que se resuelvan los conflictos , puedes hacer clic en el botón "Merge pull request".
 
- 3️⃣ Fusionar mergeDavid-Jose a main
    - New PR de main <---- mergeDavid-Jose
    - Repetir los mismos pasos y aprobar el PR y mergear.

# Funcionalidades y trabajo pendientes

### Trabajo pendiente o a revisar

    - David revisa los archivos nav-horizontal. el HTML el SCSS y el TS
      - Ahi encuentras la logica para los links
      - Lo unico que habria que cambiar es algo del SCSS, ya que se ilumina todo el icono, no la parte de abajo de la palabra
