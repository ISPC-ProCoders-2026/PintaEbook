import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

interface SampleSection {
  title: string;
  paragraphs: string[];
}

interface SampleChapter {
  title: string;
  sections: SampleSection[];
}

interface SampleBook {
  title: string;
  author: string;
  genre: string;
  theme: string;
  description: string;
  chapters: SampleChapter[];
}

const sampleBooks: Record<string, SampleBook | undefined> = {
  'donde-nace-la-luz': {
    title: 'Donde nace la luz', author: 'Lucía Ferrer', genre: 'Ficción contemporánea', theme: 'terracotta',
    description: 'Una ciudad, una carta y la oportunidad de empezar de nuevo.',
    chapters: [
      { title: 'La carta bajo la puerta', sections: [
        { title: 'Una mañana distinta', paragraphs: [
          'La carta apareció un martes, justo cuando Clara había decidido dejar de esperar noticias. No tenía remitente. Solo su nombre, escrito con una tinta azul que parecía guardar un poco de cielo.',
          'Afuera, la ciudad despertaba despacio. El sol se abría paso entre los edificios y dibujaba una franja dorada sobre el piso de madera. Clara respiró hondo antes de romper el sobre.',
        ] },
        { title: 'Lo que vuelve', paragraphs: [
          'Adentro encontró una llave pequeña y una frase: «Hay lugares que todavía te recuerdan». Reconoció la letra enseguida. Hacía años que no la veía, pero algunas cosas no necesitan presentación.',
        ] },
      ] },
      { title: 'La casa del pasaje', sections: [
        { title: 'Volver a abrir', paragraphs: [
          'La casa seguía al final del pasaje, escondida detrás de una glicina. Clara apoyó la llave en la cerradura. El mecanismo cedió con un clic breve, como si también hubiera estado esperando.',
          'Sobre la mesa descansaba un cuaderno vacío. Por primera vez en mucho tiempo, Clara no sintió apuro por llenarlo. Abrió la ventana y dejó entrar la mañana.',
        ] },
      ] },
    ],
  },
  'el-jardin-de-las-horas': {
    title: 'El jardín de las horas', author: 'Martín Saavedra', genre: 'Narrativa', theme: 'forest',
    description: 'En un jardín secreto, cada reloj guarda un recuerdo.',
    chapters: [
      { title: 'El portón verde', sections: [
        { title: 'Después de la lluvia', paragraphs: [
          'El portón apareció al final del sendero, cubierto de hojas nuevas. Tomás no recordaba haberlo visto antes, aunque había recorrido ese parque desde que era chico.',
          'Al empujarlo, un aroma a tierra húmeda y jazmín lo envolvió. En el centro del jardín había un reloj de pie, quieto bajo un limonero. Marcaba las cinco y doce.',
        ] },
      ] },
      { title: 'Los minutos guardados', sections: [
        { title: 'Una voz conocida', paragraphs: [
          'El reloj dio una campanada. Desde algún rincón llegó la risa de su abuela, cálida e inconfundible. Tomás cerró los ojos y, por un instante, volvió a tener diez años.',
          'Comprendió entonces que aquel jardín no detenía el tiempo: lo cuidaba. Cada hora esperaba a alguien dispuesto a recordar.',
        ] },
      ] },
    ],
  },
  'cartas-al-mar': {
    title: 'Cartas al mar', author: 'Julia Ares', genre: 'Poesía', theme: 'ink',
    description: 'Poemas para decir en voz baja lo que el agua se lleva.',
    chapters: [
      { title: 'Orilla', sections: [
        { title: 'Marea baja', paragraphs: [
          'Dejé mi nombre en la arena\npara que el agua lo aprendiera.\nLa ola llegó sin hacer ruido\ny se llevó solo el miedo.',
          'Después quedó la playa,\nrespirando despacio,\ncomo quien guarda un secreto\npara la próxima marea.',
        ] },
      ] },
      { title: 'Lo que vuelve', sections: [
        { title: 'Carta sin sobre', paragraphs: [
          'Mar, si encontrás estas palabras,\nno hace falta que las devuelvas.\nSolo dejalas cerca de la costa,\ndonde alguien pueda empezar de nuevo.',
        ] },
      ] },
    ],
  },
  'la-casa-de-los-pajaros': {
    title: 'La casa de los pájaros', author: 'Sofía Cárdenas', genre: 'Misterio', theme: 'gold',
    description: 'Una casa vacía. Todas las noches, una ventana se enciende.',
    chapters: [
      { title: 'La ventana encendida', sections: [
        { title: 'Una luz a medianoche', paragraphs: [
          'A las doce en punto, la ventana del ático volvió a encenderse. Inés la observó desde la vereda, con la libreta apretada contra el pecho y la certeza de que la casa llevaba años deshabitada.',
          'Un pájaro cruzó el cielo oscuro y se posó sobre el tejado. No cantó. Miró hacia la ventana, como si también esperara una respuesta.',
        ] },
      ] },
      { title: 'El inventario', sections: [
        { title: 'Una pista entre las páginas', paragraphs: [
          'La puerta no estaba cerrada con llave. En el recibidor, una hilera de jaulas vacías cubría la pared. Todas tenían la puerta abierta, salvo una.',
          'Dentro, Inés encontró una nota doblada en cuatro: «Si la luz vuelve, seguí al pájaro». La tinta todavía estaba fresca.',
        ] },
      ] },
    ],
  },
};

@Component({
  selector: 'app-book-sample',
  imports: [RouterLink],
  templateUrl: './book-sample.html',
  styleUrl: './book-sample.css',
})
export class BookSample {
  private readonly route = inject(ActivatedRoute);
  readonly book = toSignal(
    this.route.paramMap.pipe(map((params) => sampleBooks[params.get('slug') ?? ''])),
    { initialValue: sampleBooks[this.route.snapshot.paramMap.get('slug') ?? ''] },
  );
}
