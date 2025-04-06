import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { Book,ReadingRecord } from '../../models/book-model';
// La interfaz Book ya está definida en book-model.ts, no la redefinas aquí

@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Array de todos los libros con datos extendidos
  private books: Book[] = [
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de Cristal',
      titulo: 'Trono de Cristal',
      sinopsis:
        'Tras cumplir una condena de un año de trabajos forzados en las minas de sal de Endovier por sus crímenes, Celaena Sardothien, una asesina de 18 años de edad, es llevada ante el príncipe heredero. El príncipe Dorian le ofrece su libertad con una condición: ella debe actuar como su defensora en un torneo para encontrar un nuevo asesino real.',
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
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Ciudad medialuna',
      titulo: 'Casa de llama y sombra',
      sinopsis:
        'Celaena Sardothien ha ganado el torneo real y se ha convertido en la campeona del rey, pero su lealtad no pertenece al trono. Mientras realiza misiones para el monarca, descubre una conspiración que amenaza el reino entero. Celaena debe elegir entre su libertad y luchar por un futuro mejor para el reino.',
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
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Caraval',
      titulo: 'Caraval',
      sinopsis:
        'Celaena Sardothien ha aceptado su identidad como Aelin Galathynius, reina de Terrasen. Viaja a Wendlyn para encontrar respuestas y entrenar con Rowan, un guerrero fae inmortal. Mientras tanto, fuerzas oscuras se están reuniendo para amenazar todo lo que ama, y ella debe aprender a controlar sus poderes para proteger su reino.',
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
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'De sangre y cenizas',
      titulo: 'De sangre y cenizas',
      sinopsis:
        'Aelin Galathynius ha regresado a Adarlan para reclamar su trono y vengar a su pueblo. Pero antes, debe reunir antiguos aliados y formar nuevas alianzas para enfrentar al rey oscuro que amenaza su tierra natal. En el proceso, descubre secretos que podrían cambiar el curso de la guerra.',
      imagen: '/libros/De sangre y cenizas/covers/De sangre y cenizas.png',
      paginasTotales: 625,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'El principe cautivo',
      titulo: 'El principe cautivo',
      sinopsis:
        'El reino está al borde de la guerra, y Aelin ha sido capturada por la reina de las hadas. Sus amigos están dispersos, cada uno enfrentando sus propias batallas. La única esperanza para su liberación es forjar alianzas improbables y descubrir la clave para derrotar a un enemigo ancestral antes de que sea demasiado tarde.',
      imagen: '/libros/El principe cautivo/covers/El principe cautivo.png',
      paginasTotales: 465,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Empireo',
      titulo: 'Alas de onix',
      sinopsis:
        'Aelin y sus compañeros luchan contra el tiempo mientras el mundo se precipita hacia la oscuridad. Con los Valg amenazando con conquistarlo todo, la única esperanza es encontrar y utilizar una antigua llave que podría salvar a los reinos o condenarlos. Las lealtades serán probadas y se formarán nuevos lazos en esta penúltima entrega.',
      imagen: '/libros/Empireo/covers/Alas de onix.png',
      paginasTotales: 510,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Trono de Cristal',
      titulo: 'Reino de Cenizas',
      sinopsis:
        'En la épica conclusión de la serie, Aelin arriesgará todo para salvar su mundo, incluso mientras enfrenta cadenas y torturas. Sus amigos y aliados están preparados para la batalla final contra un enemigo que amenaza con destruir no solo su reino, sino todos los mundos. El destino de todos descansa sobre sus hombros.',
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
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Hunting Adeline',
      titulo: 'Nunca te dejare',
      sinopsis:
        'Feyre, una cazadora de 19 años, mata a un lobo en el bosque y una bestia exige retribución. Arrastrada a una tierra mágica, descubre que su captor no es un animal sino Tamlin, un inmortal que una vez gobernó el mundo feérico. Mientras vive en su estado, sus sentimientos por él se transforman de hostilidad a pasión. Pero una antigua sombra crece sobre las tierras feéricas, y Feyre debe encontrar la manera de detenerla.',
      imagen: '/libros/Hunting Adeline/covers/Nunca te dejare.png',
      paginasTotales: 485,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Una Corte de Rosas y Espinas',
      titulo: 'Una Corte de Rosas y Espinas',
      sinopsis:
        'Feyre ha sobrevivido a Bajo la Montaña, pero a un costo terrible. Aunque ahora tiene poderes de alto fae, su corazón permanece humano, y no puede olvidar las atrocidades que tuvo que cometer para salvar al pueblo de Tamlin. Tampoco puede olvidar el pacto que hizo con Rhysand, el Alto Lord de la Corte Nocturna, quien ahora la reclama como parte del trato.',
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
      ]
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'La Caida Lunar',
      titulo: 'Hasta que caiga la luna',
      sinopsis:
        'Una novela corta que sigue a Feyre y Rhysand mientras navegan por los desafíos posteriores a la guerra. Juntos enfrentan el proceso de reconstrucción y ayudan a sanar las heridas del conflicto, mientras también tratan de encontrar momentos de paz en un mundo que aún está cicatrizando.',
      imagen: '/libros/La Caida Lunar/covers/Hasta que caiga la luna.png',
      paginasTotales: 320,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Los habitantes del aire',
      titulo: 'El rey malvado',
      sinopsis:
        'La historia sigue las consecuencias de la guerra contra Hybern. Nesta Archeron lucha con la pérdida y su transformación forzada en inmortal. A regañadientes, acepta entrenarse con Cassian en la Casa del Viento, donde debe enfrentar sus demonios internos mientras una nueva amenaza surge en el horizonte.',
      imagen: '/libros/Los habitantes del aire/covers/El rey malvado.png',
      paginasTotales: 530,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Sarah J. Maas',
      saga: 'Powerless',
      titulo: 'Powerless',
      sinopsis:
        'Feyre ha regresado a la Corte de Primavera, decidida a reunir información sobre los planes de Tamlin y del rey invasor que amenaza con destruir Prythian. Pero para hacerlo, debe jugar un juego mortal de engaño. Un solo error podría condenar no solo a Feyre, sino a todo su mundo.',
      imagen: '/libros/Powerless/covers/Powerless.png',
      paginasTotales: 395,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Jay Kristoff',
      saga: 'El Imperio del Vampiro',
      titulo: 'El Imperio del Vampiro',
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
      ]
    },
    {
      autor: 'Jay Kristoff',
      saga: 'Dioses y monstruos',
      titulo: 'El libro de azrael',
      sinopsis:
        'Gabriel de León continúa su relato desde la prisión, narrando su búsqueda del Grial de Sangre. Mientras el ejército de la Reina Oscura se mueve inexorablemente hacia el último bastión de la humanidad, Gabriel y sus compañeros se adentran en territorios cada vez más peligrosos, enfrentándose a horrores inimaginables y sacrificios imposibles.',
      imagen: '/libros/Dioses y monstruos/covers/El libro de azrael.png',
      paginasTotales: 680,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
    },
    {
      autor: 'Arancha Abad',
      saga: '',
      titulo: 'Mi Alma es Tuya',
      sinopsis:
        'Luna, una joven con un pasado oscuro, vive con su hermana gemela en un pequeño pueblo. Su vida cambia cuando conoce a Ethan, un chico misterioso con quien establece una conexión inmediata. Pero Ethan esconde un secreto sobrenatural que pondrá a prueba su relación y cambiará para siempre la vida de Luna, quien descubrirá que está más conectada con el mundo sobrenatural de lo que jamás hubiera imaginado.',
      imagen: '/libros/Alma/covers/Mi alma es tuya.png',
      paginasTotales: 350,
      estado: 'no-iniciado',
      paginasLeidas: 0,
      progreso: 0
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