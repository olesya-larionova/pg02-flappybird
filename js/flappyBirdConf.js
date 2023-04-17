// размеры спрайта птички (на основе используемого изображения)
const birdWidth = 34;
const birdHeight = 24;

// размеры фона (на основе используемого изображения)
const bgHeight = 768;
const bgWidth = 432;

// размеры труб (на основе используемого изображения)
const pipeHeight = 902;
const pipeWidth = 68;

const pipesDist = pipeWidth * 4; // расстояние между левыми краями труб
const pipeGap = birdHeight * 5;  // зазор в трубе = высота птички * 5

const maxGapChange = 0.2;  // половина максимальной разницы в положении зазора труб в долях высоты экрана
const fallAcceleration = 0.15; // ускорение свободного падения
const flyUpDist = 0;  // высота подскока птички после клика
const flyUpSpeed = 4; // начальная скорость взлета птички после клика
const pipeSpeed = 2; // скорость движения труб

/* //весьма комфортные значения для самых маленьких игроков
const maxGapChange = 0.3;
const fallAcceleration = 0.1; // ускорение свободного падения
const flyUpDist = 0;  // высота подскока птички после клика
const flyUpSpeed = 3; // начальная скорость взлета птички после клика
const pipeSpeed = 1; // скорость движения труб
*/
