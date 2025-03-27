# Proyecto Lectoria
 
Este proyecto consiste en el desarrollo de una página web interactiva para la gestión y seguimiento de lecturas. La plataforma permite a los usuarios registrar los libros que han leído, gestionar sus lecturas en curso y planificar futuras lecturas mediante una lista de deseos. Además, los usuarios pueden agregar información detallada como fechas de inicio y finalización, imágenes de las portadas, puntuaciones, etc.

Para mejorar la experiencia, el sistema ofrece estadísticas de lecturas, proporcionando datos visuales sobre la cantidad de libros leídos por meses o años, tendencias de géneros, hábitos de lectura y otras métricas relevantes. La interfaz será intuitiva y fácil de utilizar para actualizar y eliminar las lecturas.

El objetivo principal de esta aplicación es brindar a los usuarios una herramienta centralizada donde puedan organizar y analizar su actividad lectura de manera eficiente y visualmente atractiva.

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

### Funcionalidades

- [x] Creacion carpetas
- [x] Creacion componentes base
- [ ] Modo dia/noche (default noche)
- [ ] Subir pdf y leerlo
  - [ ] Buscar en api el libro y enseñar los datos


# Distribucion de carpetas y trabajo

🟢🔴

```
︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿
📁 LectoriaFront
│-- 📁 public                         # Carpeta de contenido multimedia
│    │-- 📁 logos                     # Carpeta de logos
│    │    ⤷-- 📖 logo_pagina.png      # Logo principal de la pagina
│    │
│    ⤷-- 📁 Libros                            # Contiene todos los libros
│         ⤷-- 📁 nombre_libro 🟢Jose          # Nombre de los libros que existen
│             │-- 📁 covers🟢 Jose            # Imagen de las portadas de los libros
│             ⤷-- 📁 fondos🔴 Jose            # Imagen de fondo para home
│-- 📁 src                              # Código fuente
│    │-- 📁 app                         # Módulos principales de Angular
│    │   │-- 📁 Admin                   # Carpeta para componentes de admin (si da tiempo)
│    │   │-- 📁 Client                  # Carpeta para componentes de cliente
│    │   │    │-- 📁 Ajustes
│    │   │    │    ⤷-- 🗃️ ajustes.component🔴                 # Componente base de ajustes
│    │   │    │-- 📁 Biblioteca
│    │   │    │    ⤷-- 🗃️ Biblioteca.component🔴 David        # Componente base de biblioteca
│    │   │    │-- 📁 Calificaciones
│    │   │    │    ⤷-- 🗃️ calificaciones.component🔴          # Componente base de calificaciones
│    │   │    │-- 📁 Estadisticas
│    │   │    │    ⤷-- 📁 graficos                                        # Carpeta que contiene los componentes de los graficos
│    │   │    │         │-- 🗃️ graphics.component🔴                       # Componente donde se pintan los graficos
│    │   │    │         ⤷-- 📁 cajas                                      # Diferentes cajas para graficos
│    │   │    │              ⤷-- 🗃️  graphics-caja-uno.component🔴        # Componentes de graficos
│    │   │    │-- 📁 Features                                 # Carpeta de componentes secundarios
│    │   │    │    │-- 📁 Inicio sesion
│    │   │    │    │    ⤷-- 🗃️ inicio-sesion.component🔴      # Componente base de inicio de seion
│    │   │    │    │-- 📁 Registro
│    │   │    │    │    ⤷-- 🗃️ registro.component🔴           # Componente base de registro
│    │   │    │    │-- 📁 Buscador libros
│    │   │    │    │    ⤷-- 🗃️ buscador-libros.component🔴    # Componente base de buscador libors
│    │   │    │    ⤷-- 📁 Buscador Autores
│    │   │    │         ⤷-- 🗃️ buscador-autores.component🔴  # Componente base de buscador autores
│    │   │    │-- 📁 Header
│    │   │    │    │-- 🗃️ nav-horizontal.component🟡 Jose     #header horizontal
│    │   │    │    ⤷-- 🗃️ nav-vertical.component🔴 David      #header vertical
│    │   │    │-- 📁 inicio
│    │   │    │    │-- 🗃️ inicio.component🔴 Jose                 # Componente base de inicio
│    │   │    │    │-- 🗃️ Carrusel.component🔴 Jose               # Carrusel de portadas de libro
│    │   │    │    ⤷-- 🗃️ Imagenes-saga.component🔴 Jose          # Imagenes de la saga correspondiente al libro
│    │   │    │-- 📁 Layout             # Estructura o diseño general
│    │   │    │-- 📁 Lectura actual
│    │   │    │    ⤷-- 🗃️ lectura-actual.component🔴          # Componente base de lectura actual
│    │   │    ⤷-- 📁 Pendientes
│    │   │         ⤷-- 🗃️ pendientes.component🔴              # Componente base de pendientes
│    │   │
│    │   │-- 📁 core                        # Recursos compartidos entre módulos
│    │   │    │-- 📁 services               # Servicios para consumo de API y lógica de negocio
│    │   │    │    ⤷-- 🗄️ service.ts🟡
│    │   │    │-- 📁 models                 # Modelos de organización y agrupación de componentes, directivas y servicios en Angular.
│    │   │    │    ⤷-- 🗄️ model.ts🟡
│    │   │    ⤷-- 📁 interfaces             # Interfaces para definición de estructuras de datos para tipado y validación.
│    │   │         ⤷-- 🗄️ interface.ts🟡
│    │   │
│    │   ⤷-- 📁 page-not-found                                # Página por defecto cuando no se encuentra url
│    │        ⤷-- 🗃️ page-not-found.component🟢Jose           # Componente base de pagina no encontrada
│    │-- 📁 assets                          # Recursos estaticos
│    │    │-- 📁 fonts                      # Fuentes de escritura
│    │    │-- 📄 animations.scss🔴          # Animaciones predeterminadas
│    │    │-- 📄 colors.scss🟢Jose          # Colores predeterminados
│    │    ⤷-- 📄 fonts.scss🔴               # Fuentes de escritura
│    ⤷-- 📄 app.module.ts
│-- 📁 environments
│-- 📁 tests
│-- 📁 docs
│-- 📁 e2e
│-- 📄 angular.json
│-- 📄 package.json
│-- 📄 tsconfig.json
│-- 📄 .gitignore
│-- 📄 README.md
⤷-- 📄 LICENSE
︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿︵‿
```

# 🏗️ Apartados de la Página Web

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
