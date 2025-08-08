
export default function obtenerCategoria(fechaNacimiento, nivel) {
  const fecha = new Date(fechaNacimiento);
  const cutoffDate = new Date('2025-07-01');

  const edadAlCorte = cutoffDate.getFullYear() - fecha.getFullYear() - (
    cutoffDate < new Date(cutoffDate.getFullYear(), fecha.getMonth(), fecha.getDate()) ? 1 : 0
  );

  const time = fecha.getTime();

  // Convertimos los rangos a timestamps para comparar más fácilmente
  const rangos = {
    'PRE-INFANTIL': [
      new Date('2021-07-01').getTime(),
      new Date('2025-06-30').getTime()
    ],
    'INFANTIL A': [
      new Date('2018-07-01').getTime(),
      new Date('2021-06-30').getTime()
    ],
    'INFANTIL B': [
      new Date('2015-07-01').getTime(),
      new Date('2018-06-30').getTime()
    ],
    'JUVENIL A': [
      new Date('2011-07-01').getTime(),
      new Date('2015-06-30').getTime()
    ],
    'JUVENIL B': [
      new Date('2007-07-01').getTime(),
      new Date('2011-06-30').getTime()
    ],
    'MAYOR': [
      new Date('1997-07-01').getTime(),
      new Date('2007-06-30').getTime()
    ]
  };

  if (nivel === 'NOVICIOS') {
    if (edadAlCorte >= 10 && edadAlCorte < 16) {
      return 'NOVICIOS (ADVANCED NOVICE) ISU';
    }else{
      return 'NOVICIOS ABIERTO'
    }
  } else if (nivel === 'AVANZADOS 1') {
    if (edadAlCorte >= 13 && edadAlCorte < 19) {
      return 'AVANZADOS 1 (JUNIOR) ISU';
    }else{
      return 'AVANZADOS 1 ABIERTO'
    }
  } else if (nivel === 'AVANZADOS 2') {
    if (edadAlCorte >= 17) {
      return 'AVANZADOS 2 (SENIOR) ISU';
    }else{
      return 'AVANZADOS 2 ABIERTO'
    }
  } else {
    // Resto de niveles por fecha
    for (const [categoria, [inicio, fin]] of Object.entries(rangos)) {
      if (time >= inicio && time <= fin) {
        return categoria;
      }
    }

    // Adulto: nacido antes del 1 de julio de 1997
    if (time < new Date('1997-07-01').getTime()) {
      return 'ADULTO';
    }
  }

  return 'Sin categoría aplicable';
}
