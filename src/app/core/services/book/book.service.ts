import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Book, ReadingRecord } from '../../models/book-model';
// La interfaz Book ya está definida en book-model.ts, no la redefinas aquí

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Array de todos los libros con datos extendidos
  private books: Book[] = [
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de cristal',
      titulo: 'Trono de Cristal',
      sinopsis:
        'Tras cumplir una condena de un año de trabajos forzados en las minas de sal de Endovier por sus crímenes, Celaena Sardothien, una asesina de 18 años de edad, es llevada ante el príncipe heredero. El príncipe Dorian le ofrece su libertad con una condición: ella debe actuar como su campeona en un torneo para encontrar un nuevo asesino real.',
      imagen: '/libros/Trono de cristal/covers/Trono de cristal.png',
      paginasTotales: 432,
      fechaInicio: new Date(2025, 2, 3), // 3 de marzo de 2025
      fechaFin: new Date(2025, 2, 15), // 15 de marzo de 2025
      paginasLeidas: 432,
      progreso: 100,
      estado: 'finalizado',
      valoracion: 4,
      registroLectura: [
        { fecha: new Date(2025, 2, 3), paginasLeidas: 45, tiempo: 60 },
        { fecha: new Date(2025, 2, 4), paginasLeidas: 32, tiempo: 45 },
        { fecha: new Date(2025, 2, 7), paginasLeidas: 78, tiempo: 90 },
        { fecha: new Date(2025, 2, 8), paginasLeidas: 25, tiempo: 30 },
        { fecha: new Date(2025, 2, 10), paginasLeidas: 67, tiempo: 75 },
        { fecha: new Date(2025, 2, 12), paginasLeidas: 85, tiempo: 100 },
        { fecha: new Date(2025, 2, 13), paginasLeidas: 45, tiempo: 60 },
        { fecha: new Date(2025, 2, 14), paginasLeidas: 40, tiempo: 50 },
        { fecha: new Date(2025, 2, 15), paginasLeidas: 15, tiempo: 20 }
      ],
      anotaciones: [
        "Celaena es un personaje fascinante, mezcla de arrogancia y vulnerabilidad",
        "El mundo de Erilea tiene una interesante historia política",
        "Los personajes secundarios son sorprendentemente complejos"
      ],
      frases: [
        "Mi nombre es Celaena Sardothien. Pero no será lo único que sepan de mí.",
        "Las bibliotecas siempre habían sido su paraíso en la Tierra.",
        "Algún día, las puertas del infierno parecerán amables comparadas con lo que te haré."
      ]
    },
    {
      autor: 'Stephanie Garber',
      saga: 'Ciudad medialuna',
      titulo: 'Casa de llama y sombra',
      sinopsis:
        'Bryce Quinlan tenía la vida perfecta, trabajando todo el día y de fiesta toda la noche, hasta que un demonio asesinó a sus amigos y la dejó destrozada. Cuando el acusado es liberado, Bryce encuentra un aliado improbable en Hunt Athalar, un ángel caído esclavizado, que la ayudará a cazar al verdadero asesino y vengar la muerte de sus amigos.',
      imagen: '/libros/Ciudad medialuna/covers/Casa de llama y sombra.png',
      paginasTotales: 384,
      fechaInicio: new Date(2025, 1, 15), // 15 de febrero de 2025
      fechaFin: new Date(2025, 1, 28), // 28 de febrero de 2025
      paginasLeidas: 384,
      progreso: 100,
      estado: 'finalizado',
      valoracion: 5,
      registroLectura: [
        { fecha: new Date(2025, 1, 15), paginasLeidas: 30, tiempo: 45 },
        { fecha: new Date(2025, 1, 16), paginasLeidas: 42, tiempo: 60 },
        { fecha: new Date(2025, 1, 18), paginasLeidas: 56, tiempo: 70 },
        { fecha: new Date(2025, 1, 20), paginasLeidas: 48, tiempo: 65 },
        { fecha: new Date(2025, 1, 22), paginasLeidas: 62, tiempo: 85 },
        { fecha: new Date(2025, 1, 24), paginasLeidas: 58, tiempo: 75 },
        { fecha: new Date(2025, 1, 26), paginasLeidas: 52, tiempo: 70 },
        { fecha: new Date(2025, 1, 28), paginasLeidas: 36, tiempo: 50 }
      ],
      anotaciones: [
        "Bryce es una protagonista refrescante y diferente a otros personajes de SJM",
        "La mitología urbana está muy bien construida",
        "Las escenas de acción son intensas y bien descritas"
      ],
      frases: [
        "A través de amor, todas las cosas son posibles.",
        "La verdad siempre sale a la luz.",
        "Cuando encuentras algo o a alguien por quien vale la pena luchar, luchas, y nunca lo sueltas."
      ]
    },
    {
      autor: 'Stephanie Garber',
      saga: 'Caraval',
      titulo: 'Caraval',
      sinopsis:
        'Scarlett Dragna nunca ha abandonado la pequeña isla donde ella y su hermana, Tella, viven con su cruel padre. Ahora, Scarlett está a punto de ver su sueño hecho realidad: asistir a Caraval, el juego mágico y legendario. Pero cuando llega, Tella es secuestrada por Legend, el maestro de ceremonias. Este año, el premio del ganador es encontrar a Tella, y Scarlett tiene solo cinco noches para encontrarla.',
      imagen: '/libros/Caraval/covers/Caraval.png',
      paginasTotales: 416,
      fechaInicio: new Date(2025, 3, 2), // 2 de abril de 2025
      fechaFin: null,
      paginasLeidas: 187,
      progreso: 45,
      estado: 'en-progreso',
      registroLectura: [
        { fecha: new Date(2025, 3, 2), paginasLeidas: 38, tiempo: 50 },
        { fecha: new Date(2025, 3, 3), paginasLeidas: 42, tiempo: 55 },
        { fecha: new Date(2025, 3, 5), paginasLeidas: 100, tiempo: 45 },
        { fecha: new Date(2025, 3, 7), paginasLeidas: 39, tiempo: 50 },
        { fecha: new Date(2025, 3, 8), paginasLeidas: 33, tiempo: 40 }
      ],
      anotaciones: [
        "El ambiente circense y mágico es cautivador",
        "Los giros de la trama son inesperados",
        "La relación entre las hermanas es el verdadero corazón del libro"
      ],
      frases: [
        "Recuerda, es solo un juego.",
        "Cada persona tiene un sueño diferente, una historia diferente.",
        "Lo que sucede en Caraval se queda en Caraval."
      ]
    },
    {
      autor: 'Jennifer L. Armentrout',
      saga: 'De sangre y cenizas',
      titulo: 'De sangre y cenizas',
      sinopsis:
        'Poppy, una Doncella, ha vivido toda su vida en aislamiento mientras aguarda el día de su Ascensión. No sabe que esperar, pero ha oído historias aterradoras sobre lo que ocurre después. Cuando conoce a Hawke, un guardia asignado a su protección, se siente tentada a romper las reglas que han mantenido su existencia a salvo. Pero debajo de la atracción, hay un secreto peligroso que podría destruirlo todo.',
      imagen: '/libros/De sangre y cenizas/covers/De sangre y cenizas.png',
      paginasTotales: 625,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "El sistema de castas y el mundo ficticio tienen muchas capas",
        "La protagonista Poppy es interesante por su posición de vulnerabilidad y poder a la vez",
        "El romance tiene elementos de 'enemigos a amantes' que promete ser intenso"
      ],
      frases: [
        "A veces, el corazón reconoce lo que la mente rechaza.",
        "El miedo es una emoción necesaria. Te mantiene vivo.",
        "Algunos secretos son demasiado peligrosos para ser revelados."
      ]
    },
    {
      autor: 'C.S. Pacat',
      saga: 'El principe cautivo',
      titulo: 'El principe cautivo',
      sinopsis:
        'Damen es un guerrero y el legítimo heredero al trono de Akielos. Pero cuando su medio hermano se apodera del poder, Damen es capturado, despojado de su identidad y enviado como esclavo a servir al príncipe de una nación enemiga. Laurent es frío, bello y manipulador, un hombre con quien Damen no puede revelar su verdadera identidad, ya que en ese país, el nombre de Damen es sinónimo de muerte.',
      imagen: '/libros/El principe cautivo/covers/El principe cautivo.png',
      paginasTotales: 465,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "La dinámica de poder entre los protagonistas es fascinante",
        "La construcción del mundo y la política entre reinos es compleja y bien desarrollada",
        "El autor maneja magistralmente la tensión entre los personajes principales"
      ],
      frases: [
        "Un esclavo no tiene poder excepto lo que le concede un amo generoso.",
        "La política es como un juego de mesa; quienes mejor entienden sus reglas rara vez son quienes mueven las piezas.",
        "Las lealtades, como las promesas, son fáciles de romper cuando se hacen bajo coacción."
      ]
    },
    {
      autor: 'Victoria Aveyard',
      saga: 'Empireo',
      titulo: 'Alas de onix',
      sinopsis:
        'En una sociedad divida por sangre, la Roja es la de la gente común y la Plateada es la de los que poseen poderes sobrenaturales. Mare Barrow es una Roja, pero tiene un poder Plateado que no entiende. En una peligrosa corte real, los principios políticos y las rebeldías personales de Mare marcarán su camino, mientras descubre que cualquiera puede traicionar a cualquiera.',
      imagen: '/libros/Empireo/covers/Alas de onix.png',
      paginasTotales: 510,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "La división de clases basada en la sangre refleja problemas sociales reales",
        "El sistema de magia basado en habilidades elementales es muy original",
        "La protagonista parece tener un arco de desarrollo prometedor como revolucionaria"
      ],
      frases: [
        "En un mundo dividido por sangre, ¿de qué lado estás?",
        "La revolución comienza con una chispa, pero termina en un incendio.",
        "La diferencia entre la supervivencia y el poder es saber cuándo usar cada uno."
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de cristal',
      titulo: 'Reino de Cenizas',
      sinopsis:
        'Aelin Galathynius ha prometido su lealtad a muchos—a su pueblo, a su príncipe, a su amante y a su amigo. Pero la promesa de Aelin a su tierra está por encima de todo: proteger Terrasen de sus enemigos. Para demostrar esa promesa, debe recuperar la legendaria llave Wyrd de la puerta. Y cuando por fin derrota a los reyes y reinas que envían a sus ejércitos contra ella, se encuentra encadenada en un calabozo, destinada a soportar meses de tortura.',
      imagen: '/libros/Trono de cristal/covers/Reino de cenizas.png',
      paginasTotales: 578,
      fechaInicio: new Date(2024, 11, 15), // 15 de diciembre de 2024
      fechaFin: new Date(2025, 0, 8), // 8 de enero de 2025
      paginasLeidas: 578,
      progreso: 100,
      estado: 'finalizado',
      valoracion: 5,
      registroLectura: [
        { fecha: new Date(2024, 11, 15), paginasLeidas: 40, tiempo: 55 },
        { fecha: new Date(2024, 11, 17), paginasLeidas: 38, tiempo: 50 },
        { fecha: new Date(2024, 11, 19), paginasLeidas: 45, tiempo: 60 },
        { fecha: new Date(2024, 11, 21), paginasLeidas: 52, tiempo: 70 },
        { fecha: new Date(2024, 11, 23), paginasLeidas: 50, tiempo: 65 },
        { fecha: new Date(2024, 11, 25), paginasLeidas: 42, tiempo: 55 },
        { fecha: new Date(2024, 11, 27), paginasLeidas: 48, tiempo: 65 },
        { fecha: new Date(2024, 11, 29), paginasLeidas: 51, tiempo: 70 },
        { fecha: new Date(2024, 11, 31), paginasLeidas: 60, tiempo: 80 },
        { fecha: new Date(2025, 0, 2), paginasLeidas: 55, tiempo: 75 },
        { fecha: new Date(2025, 0, 4), paginasLeidas: 47, tiempo: 65 },
        { fecha: new Date(2025, 0, 6), paginasLeidas: 38, tiempo: 50 },
        { fecha: new Date(2025, 0, 8), paginasLeidas: 12, tiempo: 20 }
      ],
      anotaciones: [
        "El final épico que la saga merece",
        "Los personajes secundarios tienen arcos narrativos increíbles",
        "Las escenas de batalla son cinematográficas",
        "El desarrollo del romance entre Aelin y Rowan es perfecto"
      ],
      frases: [
        "Recuerda que toda la oscuridad del mundo no puede apagar la luz de una sola vela.",
        "El mundo seguirá girando, incluso si no estamos aquí para verlo.",
        "Para lo que sea que venga después, para quien venga después, no dejaremos nada salvo un mundo mejor."
      ]
    },
    {
      autor: 'H.D. Carlton',
      saga: 'Hunting Adeline',
      titulo: 'Nunca te dejare',
      sinopsis:
        'Adeline Reilly, una mujer con un pasado traumático, se encuentra en el radar de un asesino en serie obsesionado con ella. Mientras lucha por sobrevivir y proteger a los que ama, conoce a un hombre misterioso que podría ser su salvación o su perdición. En un juego mortal donde no puede confiar en nadie, Adeline debe decidir quién está realmente de su lado antes de que sea demasiado tarde.',
      imagen: '/libros/Hunting Adeline/covers/Nunca te dejare.png',
      paginasTotales: 485,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "La trama parece combinar elementos de thriller psicológico y romance oscuro",
        "El tema de la obsesión y el trauma promete ser abordado con profundidad",
        "La atmósfera de suspense y peligro constante suena intrigante"
      ],
      frases: [
        "El miedo es la emoción más honesta que existe.",
        "A veces lo que más nos asusta no es lo que acecha en las sombras, sino lo que sentimos por ello.",
        "Nunca prometas por siempre a alguien que conoces desde hace un instante."
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Acotar',
      titulo: 'Una Corte de Rosas y Espinas',
      sinopsis:
        'Feyre, una cazadora de 19 años, mata a un lobo en el bosque y una bestia exige retribución. Arrastrada a una tierra mágica, descubre que su captor no es un animal sino Tamlin, un inmortal que una vez gobernó el mundo feérico. Mientras vive en su estado, sus sentimientos por él se transforman de hostilidad a pasión. Pero una antigua sombra crece sobre las tierras feéricas, y Feyre debe encontrar la manera de detenerla.',
      imagen: '/libros/Acotar/covers/Una corte de niebla y furia.png',
      paginasTotales: 448,
      fechaInicio: new Date(2025, 2, 20), // 20 de marzo de 2025
      fechaFin: null,
      paginasLeidas: 112,
      progreso: 25,
      estado: 'en-progreso',
      registroLectura: [
        { fecha: new Date(2025, 2, 20), paginasLeidas: 32, tiempo: 45 },
        { fecha: new Date(2025, 2, 22), paginasLeidas: 28, tiempo: 40 },
        { fecha: new Date(2025, 2, 25), paginasLeidas: 30, tiempo: 40 },
        { fecha: new Date(2025, 2, 28), paginasLeidas: 22, tiempo: 30 }
      ],
      anotaciones: [
        "Las descripciones de la Corte de Primavera son preciosas",
        "La transformación de Feyre a lo largo del libro es fascinante",
        "La maldición tiene matices interesantes de La Bella y la Bestia"
      ],
      frases: [
        "Hay buenas personas en el mundo. Y cuando las encuentras, hay que aferrarse a ellas.",
        "Sea lo que sea que te ocurra, sea lo que sea que te enfrentes, quiero que recuerdes que eres más fuerte que ellos.",
        "No me importa lo que dice la ley. No me importa lo que dice tu compromiso."
      ]
    },
    {
      autor: 'Marissa Meyer',
      saga: 'La Caida Lunar',
      titulo: 'Hasta que caiga la luna',
      sinopsis:
        'En un mundo donde la luna se acerca peligrosamente a la Tierra, Cinder, una joven mecánica y ciborg, se ve envuelta en una lucha intergaláctica y una atracción prohibida con el príncipe Kai. Mientras descubre secretos sobre su pasado misterioso, debe enfrentarse a una reina lunar despiadada y a una plaga mortal que está devastando la población de la Tierra.',
      imagen: '/libros/La Caida Lunar/covers/Hasta que caiga la luna.png',
      paginasTotales: 320,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "La combinación de ciencia ficción con elementos de cuento de hadas suena prometedora",
        "La protagonista ciborg ofrece una perspectiva única sobre la humanidad",
        "El conflicto entre la Tierra y la Luna parece tener capas políticas interesantes"
      ],
      frases: [
        "La tecnología puede reparar un corazón roto, pero no puede darle propósito.",
        "Las estrellas conocen todos nuestros secretos, pero nunca los revelan.",
        "Somos más que la suma de nuestras partes, sean de carne o de metal."
      ]
    },
    {
      autor: 'Holly Black',
      saga: 'Los habitantes del aire',
      titulo: 'El rey malvado',
      sinopsis:
        'Jude, una mortal, ha crecido en la traicionera Corte Suprema de Faerie, despreciada por su condición humana. Para ganar un lugar, debe desafiar al príncipe Cardan, hijo más joven y cruel del Alto Rey. Pero cuando la traición amenaza a la corte, Jude se ve envuelta en intrigas y engaños, descubriendo su propia capacidad para el derramamiento de sangre. Mientras luchas, civiles y coronas comienzan, ella debe tomar decisiones peligrosas.',
      imagen: '/libros/Los habitantes del aire/covers/El rey malvado.png',
      paginasTotales: 530,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "El mundo de Faerie parece oscuro, cruel y fascinante",
        "La dinámica entre mortales e inmortales explora temas de poder y vulnerabilidad",
        "El personaje de Jude suena como una antiheroína compleja y ambigua moralmente"
      ],
      frases: [
        "Si no puedo ser más fuerte que ellos, seré más astuta.",
        "La mayoría de la gente lucha para ser extraordinaria, pero en Faerie, lucho por ser ordinaria.",
        "Para engañar a un mentiroso, debes convertirte en uno mejor."
      ]
    },
    {
      autor: 'Lauren Roberts',
      saga: 'Powerless',
      titulo: 'Powerless',
      sinopsis:
        'En un mundo donde casi todos poseen algún tipo de poder sobrenatural, Paige Olmstead es una de las raras personas sin habilidades. Cuando su ciudad es atacada y su familia es secuestrada, Paige debe unir fuerzas con un enigmático extraño que podría ayudarla a descubrir que lo que siempre consideró una debilidad puede ser su mayor fortaleza.',
      imagen: '/libros/Powerless/covers/Powerless.png',
      paginasTotales: 395,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "El concepto de una protagonista sin poderes en un mundo de superpoderes es interesante",
        "Parece explorar temas de identidad y autoestima a través de la metáfora de los poderes",
        "Promete una historia de superación personal y descubrimiento interior"
      ],
      frases: [
        "A veces el mayor poder es saber cuándo no usarlo.",
        "Lo que te hace diferente es lo que te hace especial, incluso cuando esa diferencia parece una desventaja.",
        "El verdadero valor no está en tener habilidades, sino en lo que haces con lo que tienes."
      ]
    },
    {
      autor: 'Jay Kristoff',
      saga: 'El imperio del vampiro',
      titulo: 'El Imperio del vampiro',
      sinopsis:
        'Han pasado veintisiete años desde que salió el último sol. Durante casi tres décadas, los vampiros han saqueado la tierra, construyendo su eterno reino bajo el perpetuo e inquebrantable crepúsculo. Gabriel de León, medio vampiro y último de los plateados, está encarcelado por la iglesia. Cuenta su historia, desde su entrenamiento en la Orden de San Miguel hasta las leyendas de los Tres Reyes y la Última Cruzada contra la Reina Oscura.',
      imagen: '/libros/El imperio del vampiro/covers/El imperio del vampiro.png',
      paginasTotales: 736,
      fechaInicio: new Date(2025, 0, 10), // 10 de enero de 2025
      fechaFin: new Date(2025, 1, 5), // 5 de febrero de 2025
      paginasLeidas: 736,
      progreso: 100,
      estado: 'finalizado',
      valoracion: 5,
      registroLectura: [
        { fecha: new Date(2025, 0, 10), paginasLeidas: 50, tiempo: 65 },
        { fecha: new Date(2025, 0, 12), paginasLeidas: 48, tiempo: 60 },
        { fecha: new Date(2025, 0, 14), paginasLeidas: 52, tiempo: 70 },
        { fecha: new Date(2025, 0, 16), paginasLeidas: 45, tiempo: 55 },
        { fecha: new Date(2025, 0, 18), paginasLeidas: 60, tiempo: 75 },
        { fecha: new Date(2025, 0, 20), paginasLeidas: 58, tiempo: 70 },
        { fecha: new Date(2025, 0, 22), paginasLeidas: 65, tiempo: 80 },
        { fecha: new Date(2025, 0, 24), paginasLeidas: 70, tiempo: 85 },
        { fecha: new Date(2025, 0, 26), paginasLeidas: 62, tiempo: 75 },
        { fecha: new Date(2025, 0, 28), paginasLeidas: 68, tiempo: 80 },
        { fecha: new Date(2025, 0, 30), paginasLeidas: 55, tiempo: 70 },
        { fecha: new Date(2025, 1, 1), paginasLeidas: 52, tiempo: 65 },
        { fecha: new Date(2025, 1, 3), paginasLeidas: 58, tiempo: 70 },
        { fecha: new Date(2025, 1, 5), paginasLeidas: 43, tiempo: 50 }
      ],
      anotaciones: [
        "La estructura de la narración es brillante, mezclando presente y pasado",
        "El sistema de magia de la sangre es único y bien desarrollado",
        "Las escenas de acción son brutales y gráficas",
        "La amistad entre Gabriel y Aaron es el corazón emocional del libro"
      ],
      frases: [
        "La fe, como el amor, sigue siendo fe, incluso en la oscuridad.",
        "La muerte es solo el comienzo. Y los dioses saben que estoy listo para comenzar.",
        "Luz por la noche, esperanza en la oscuridad, nunca dejes que se apague la llama."
      ]
    },
    {
      autor: 'Jay Kristoff',
      saga: 'Dioses y monstruos',
      titulo: 'El libro de azrael',
      sinopsis:
        'En la ciudad de Elendor, donde dioses y monstruos caminan entre mortales, Azrael es un cazador de reliquias malditas y sirviente de la Diosa de la Muerte. Cuando una antigua reliquia desaparece del templo sagrado, Azrael es enviado a recuperarla antes de que caiga en manos equivocadas. Su búsqueda lo llevará a enfrentarse a enemigos sobrenaturales y a descubrir secretos sobre su propio origen divino.',
      imagen: '/libros/Dioses y monstruos/covers/El libro de azrael.png',
      paginasTotales: 680,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "El estilo narrativo de Kristoff promete ser oscuro y poético como en sus obras anteriores",
        "La mitología propia del autor siempre es rica y compleja",
        "Espero que tenga la misma mezcla de violencia gráfica y belleza que caracteriza sus otros libros"
      ],
      frases: [
        "La muerte no es el final del camino, sino sólo un desvío hacia otro destino.",
        "Los dioses no crean monstruos; simplemente nos dan los medios para convertirnos en ellos.",
        "En un mundo de dioses y monstruos, la línea entre héroe y villano es tan fina como el filo de una daga."
      ]
    },
    {
      autor: 'Arancha Abad',
      saga: 'Alma',
      titulo: 'Mi Alma es Tuya',
      sinopsis:
        'Cuando Alma conoce a Daniel en la universidad, siente una conexión inexplicable e inmediata con él. Lo que empieza como una amistad pronto se convierte en algo más profundo, mientras ambos luchan contra sus propios demonios personales. Pero Daniel guarda un secreto que podría destruir todo lo que están construyendo juntos, un secreto que tiene que ver con el trágico pasado de Alma y una promesa hecha muchas vidas atrás.',
      imagen: '/libros/Alma/covers/Mi alma es tuya.png',
      paginasTotales: 350,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0,
      anotaciones: [
        "Parece explorar el concepto de almas gemelas y conexiones a través del tiempo",
        "La mezcla de romance contemporáneo con elementos sobrenaturales suena interesante",
        "El tema de los secretos del pasado que afectan el presente es siempre atrapante"
      ],
      frases: [
        "Hay personas que conoces en un instante pero sientes como si las hubieras conocido toda la vida.",
        "El destino no es una cuestión de casualidad, es una cuestión de elección.",
        "A veces los secretos que guardamos para proteger a otros terminan haciendo más daño que la verdad."
      ]
    }
  ];

  // BehaviorSubject que mantiene el book actual
  private bookActualSubject: BehaviorSubject<Book | null> = new BehaviorSubject<Book | null>(null);
  
  // Observable público que otros componentes pueden suscribirse
  public bookActual$: Observable<Book | null> = this.bookActualSubject.asObservable();
  
  // BehaviorSubject para la lista completa de libros
  private booksSubject: BehaviorSubject<Book[]> = new BehaviorSubject<Book[]>(this.books);
  
  // Observable público para la lista de libros
  public books$: Observable<Book[]> = this.booksSubject.asObservable();

  constructor() {
    // Si quieres cargar un libro por defecto
    // this.actualizarBookActual(this.books[0]);
  }

  // Método para actualizar el book actual
  actualizarBookActual(book: Book): void {
    this.bookActualSubject.next(book);
  }

  // Método para obtener el libro actual directamente
  getBookActual(): Book | null {
    return this.bookActualSubject.getValue();
  }
  
  // Método para obtener todos los libros
  getAllBooks(): Book[] {
    return this.books;
  }
  
  // Método para obtener libros por estado
  getBooksByStatus(estado: 'no-iniciado' | 'en-progreso' | 'finalizado' | 'abandonado'): Book[] {
    return this.books.filter(book => book.estado === estado);
  }
  
  // Método para obtener el libro que se está leyendo actualmente
  getCurrentlyReading(): Book | null {
    const librosEnProgreso = this.getBooksByStatus('en-progreso');
    return librosEnProgreso.length > 0 ? librosEnProgreso[0] : null;
  }
  
  // Método para actualizar el progreso de lectura de un libro
  updateReadingProgress(bookId: string, paginasLeidas: number, tiempo?: number, fecha?: Date): void {
    // En una aplicación real, buscarías el libro por ID
    // Aquí simplemente usaremos el índice (asumiendo que el título es único)
    const index = this.books.findIndex(book => book.titulo === bookId);
    
    if (index !== -1) {
      const book = this.books[index];
      
      // Crear un nuevo registro de lectura
      const recordDate = fecha || new Date();
      const newRecord: ReadingRecord = {
        fecha: recordDate,
        paginasLeidas: paginasLeidas,
        tiempo: tiempo || Math.floor(paginasLeidas * 1.2) // Tiempo estimado si no se proporciona
      };
      
      // Inicializar el array si es necesario
      if (!book.registroLectura) {
        book.registroLectura = [];
      }
      
      // Comprobar si ya existe un registro para esta fecha
      const existingRecordIndex = book.registroLectura.findIndex(record => 
        record.fecha.getDate() === recordDate.getDate() &&
        record.fecha.getMonth() === recordDate.getMonth() &&
        record.fecha.getFullYear() === recordDate.getFullYear()
      );
      
      if (existingRecordIndex >= 0) {
        // Si ya existe, actualizarlo
        book.registroLectura[existingRecordIndex] = newRecord;
      } else {
        // Si no existe, añadirlo
        book.registroLectura.push(newRecord);
      }
      
      // Actualizar páginas leídas y progreso
      if (!book.paginasLeidas) {
        book.paginasLeidas = 0;
      }
      book.paginasLeidas += paginasLeidas;
      
      // Actualizar estado y progreso
      if (book.estado === 'no-iniciado') {
        book.estado = 'en-progreso';
        book.fechaInicio = recordDate;
      }
      
      if (book.paginasTotales) {
        book.progreso = Math.min(100, Math.round((book.paginasLeidas / book.paginasTotales) * 100));
        
        // Comprobar si el libro está terminado
        if (book.progreso >= 100) {
          book.estado = 'finalizado';
          book.fechaFin = recordDate;
          book.progreso = 100;
        }
      }
      
      // Actualizar el BehaviorSubject para notificar a los suscriptores
      this.booksSubject.next([...this.books]);
      
      // Si es el libro actual, actualizar también ese BehaviorSubject
      if (this.getBookActual()?.titulo === bookId) {
        this.actualizarBookActual(this.books[index]);
      }
    }
  }
  
  // Método para marcar un libro como abandonado
  abandonBook(bookId: string): void {
    const index = this.books.findIndex(book => book.titulo === bookId);
    
    if (index !== -1) {
      this.books[index].estado = 'abandonado';
      this.booksSubject.next([...this.books]);
      
      if (this.getBookActual()?.titulo === bookId) {
        this.actualizarBookActual(this.books[index]);
      }
    }
  }
  
  // Método para obtener estadísticas de lectura del mes actual
  getCurrentMonthStats() {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Recopilamos todos los registros de lectura
    let allRecords: ReadingRecord[] = [];
    this.books.forEach(book => {
      if (book.registroLectura) {
        allRecords = [...allRecords, ...book.registroLectura];
      }
    });
    
    // Filtramos los registros del mes actual
    const thisMonthRecords = allRecords.filter(record => {
      const recordDate = record.fecha;
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear;
    });
    
    // Calculamos estadísticas
    const daysRead = new Set(thisMonthRecords.map(record => record.fecha.getDate())).size;
    const pagesRead = thisMonthRecords.reduce((sum, record) => sum + record.paginasLeidas, 0);
    const timeSpent = thisMonthRecords.reduce((sum, record) => sum + (record.tiempo || 0), 0);
    const booksCompleted = this.books.filter(book => 
      book.fechaFin && 
      book.fechaFin.getMonth() === currentMonth && 
      book.fechaFin.getFullYear() === currentYear
    ).length;
    
    return {
      daysRead,
      pagesRead,
      timeSpent,
      booksCompleted
    };
  }
  
  // Método para obtener estadísticas de lectura anuales
  getYearlyStats() {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    const booksCompleted = this.books.filter(book => 
      book.fechaFin && book.fechaFin.getFullYear() === currentYear
    ).length;
    
    const pagesRead = this.books.reduce((sum, book) => {
      // Solo contamos las páginas de los libros que se han leído este año
      if (book.registroLectura) {
        const thisYearRecords = book.registroLectura.filter(record => 
          record.fecha.getFullYear() === currentYear
        );
        return sum + thisYearRecords.reduce((recordSum, record) => 
          recordSum + record.paginasLeidas, 0);
      }
      return sum;
    }, 0);
    
    return {
      booksCompleted,
      pagesRead
    };
  }
}