# Proyecto Lectoria

Este proyecto consiste en el desarrollo de una página web interactiva para la gestión y seguimiento de lecturas. La plataforma permite a los usuarios registrar los libros que han leído, gestionar sus lecturas en curso y planificar futuras lecturas mediante una lista de deseos. Además, los usuarios pueden agregar información detallada como fechas de inicio y finalización, imágenes de las portadas, puntuaciones, etc.

Para mejorar la experiencia, el sistema ofrece estadísticas de lecturas, proporcionando datos visuales sobre la cantidad de libros leídos por meses o años, tendencias de géneros, hábitos de lectura y otras métricas relevantes. La interfaz será intuitiva y fácil de utilizar para actualizar y eliminar las lecturas.

El objetivo principal de esta aplicación es brindar a los usuarios una herramienta centralizada donde puedan organizar y analizar su actividad lectura de manera eficiente y visualmente atractiva.

# 🏗️ Apartados de la Página Web

> **Actualizar**

- **Componentes generales**

  - **Nav superior**: `Nav con elementos generales`
    - Menu desplegable, inicio, biblioteca, buscador, notificaciones, modo noche/dia y logo
  - **Nav Izquierdo**: `Nav con elementos mas concretos`
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

# Dependencias

- Libreria de node-vibrant. Esta libreria nos sirve para sacar colores predominantes de una imagen (Utilizada en /home)

```bash
npm install node-vibrant@3
```

- Libreria de ngx-dropzone. Esta libreria nos sirve para subir archivos (Utilizada en user/books/add)

```bash
npm install ngx-dropzone
```

- Libreria de ng-apexcharts y apexcharts. Esta libreria nos sirve para todos los graficos de estadisticas.

```bash
npm install apexcharts ng-apexcharts

```
