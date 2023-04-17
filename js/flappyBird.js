let displacement = ((Math.random() * 2 - 1) * maxGapChange); // глобальная переменная, так как нужно хранить значение для одинакового смещения половинок трубы

class Main {

    constructor() {

        this.background = new Image;
        this.background.src = './img/background1.png';
        this.restartMsg = new Image;
        this.restartMsg.src = './img/restart.png';
        this.bird = this.initBird();
        this.pipes = new Pipes;
        this.grav = new Gravity(fallAcceleration);
        this.renderer = new Renderer;
        this.scoreCounter = new ScoreCounter;
        this.gameover = false;
    }

    initBird() {
        return new Bird('./img/birds.png', (bgWidth - birdWidth)/2, (bgHeight - birdHeight)/2);
    }

    start() {
        this.renderer.draw(this.background, this.bird, this.pipes);
    }

    createPipes() {
        this.pipes.push(new Pipe('./img/pipeTop.png', bgWidth + 100, (bgHeight - pipeGap)/ 2 - pipeHeight, pipeWidth, 'top'));  // первый разрыв в трубе созадется по центру
        this.pipes.push(new Pipe('./img/pipeBtm.png', bgWidth + 100, (bgHeight + pipeGap)/2, pipeWidth, 'btm'));
        // второй разрыв в случайном положении, но не дальше допустимых пределов
        this.pipes.push(new Pipe('./img/pipeTop.png', bgWidth + 100 + pipesDist, (bgHeight - pipeGap)/2 - pipeHeight + displacement * bgHeight, pipeWidth, 'top')); 
        this.pipes.push(new Pipe('./img/pipeBtm.png', bgWidth + 100 + pipesDist, (bgHeight + pipeGap)/2 + displacement * bgHeight, pipeWidth, 'btm'));
    }

    clickHandler() {
        if(this.gameover) { // клик мышки в состоянии завершенной игры
            this.gameover = false;
            this.bird = this.initBird();
            this.scoreCounter.reset();
            this.start();
        } else { // клик в процессе игры
            if (this.pipes.length == 0) { // так игра начнется по первому клику, до этого птичка просто машет крыльями
                this.createPipes();
            } 
            this.bird.moveUp(this.grav);
        }
    }
    
    isGameOver() {
        if (this.bird.getY() >= bgHeight - birdHeight) { // проверка на столкновение с землей
            this.gameover = true;
            return true;
        } else if (this.isCollided()) { // проверка на столкновение с трубой
            this.gameover = true;
            return true;
        } else {
            this.isPipePassed(); // проверка на прохождение трубы
            return false;
        }
    }

    isCollided() {
        return this.pipes.some((pipe) => {
            if (this.bird.x + birdWidth >= pipe.x+4 && this.bird.x <= pipe.x + pipeWidth-4) { // везде даем по несколько пикселей форы, чтоб визуально не портить столкновение
                let bird_y = this.bird.getY();
                if (pipe.type == 'top' && bird_y <= pipe.y + pipeHeight-1) { // столкновение с верхней трубой
                    return true;
                } else if (pipe.type == 'btm' && bird_y + birdHeight > pipe.y+1) { // столкновение с нижней трубой
                    return true;
                }
                return false;
            }
        });
    }

    isPipePassed() {
        this.pipes.some((pipe) => {
            let checkPoint = pipe.x + pipeWidth / 2 - this.bird.x;
            if (checkPoint > 0 && checkPoint <= pipeSpeed) {
                this.scoreCounter.inc();
                return true;
            }
        });
    }
}

class Bird {
    
    constructor(imgSrc, x, y) {
        this.image = new Image();
        this.image.src = imgSrc;
        this.x = x;
        this._y = y; //изменения y влияют на другие свойства, поэтому только через геттер/сеттер
        this.sx = 0;
        this.sy = 0;
        this.sWidth = 34;
        this.sHeight = 24;
        this.direction = 0;  // -1 - вниз, +1 - вверх
    }

    calcPos() {
        this.setY(this._y + game.grav.calcFallDist());
    }

    getY() {
        return this._y;
    }

    setY(newY) {
        
        if(newY - this._y > 2) {
            this.direction = -1;
        }
        else if (newY - this._y < - 1) {
            this.direction = 1;
        }
        else {
            this.direction = 0;
        }
        
        if (newY < 0) {
            this._y = 0;
        } else {
            this._y = newY;
        }
    }

    moveUp(grav) {
        this.setY(this._y - flyUpDist); // рывок вверх
        grav.v = -flyUpSpeed; // и будет взлетать еще какое-то время
    }
}

class Gravity {

    constructor(g) {
        this.g = g; // ускорение падения
        this.v = 0; // текущая скорость падения
    }

    calcFallDist() {
        this.v += this.g;
        return this.v;
    }
}

class Pipe {
    
    constructor(imgSrc, x, y, width, type) {
        this.image = new Image();
        this.image.src = imgSrc;
        this.x = x;
        this.y = y;
        this.width = width;
        this.type = type;
    }

    calcPos() {
        if (this.x < -this.width) {
            this.x = pipesDist * 2 - this.width; // перенос трубы в начало ее движения
            if (this.type == 'top') {
                displacement = ((Math.random() * 2 - 1) * maxGapChange);
                this.y = (bgHeight - pipeGap)/2 - pipeHeight + displacement * bgHeight;
            } else {
                this.y = (bgHeight + pipeGap)/2 + displacement * bgHeight;
            }
        } else {
            this.x -= pipeSpeed;
        }
    }
}

class Pipes extends Array {

    calcPos() {
        this.forEach(pipe => { 
            pipe.calcPos();
        })
    }
}

class Renderer {

    constructor() {
        this.cvs = document.getElementById("canvas");
        this.ctx = this.cvs.getContext("2d");
        this.letsSlowDownThoseWings = 0;
    }

    draw(bckgrnd, bird, pipes) {

        this.ctx.drawImage(bckgrnd, 0, 0);
        
        // отрисовка труб
        for (let i = 0; i < pipes.length; i++) { 
            this.ctx.drawImage(pipes[i].image, pipes[i].x, pipes[i].y);
        }
        
        // отрисовка птички, возможно с поворотом
        this.ctx.save();
        this.ctx.translate(bird.x + birdWidth/2, bird.getY() + birdHeight/2); // смещение canvas на центр птички
        this.ctx.rotate(-bird.direction / 2); // поворот в радианах
        this.letsSlowDownThoseWings++;
        if (this.letsSlowDownThoseWings > 10) {
            bird.sx = (bird.sx === birdWidth * 2 ? 0 : bird.sx + birdWidth); // расчет новой позиции внутри спрайта птички
            this.letsSlowDownThoseWings = 0;
        }
        this.ctx.drawImage(bird.image, bird.sx, bird.sy, bird.sWidth, bird.sHeight, -birdWidth/2, -birdHeight/2, bird.sWidth, bird.sHeight); // рисуем птичку на смещенный canvas
        this.ctx.restore(); // возврат canvas на место

        // пересчет позиций труб и птички
        if(pipes.length) {
            pipes.calcPos();
            bird.calcPos();
        }

        if (game.isGameOver()) {
            this.ctx.drawImage(game.restartMsg, bgWidth/2-98, bgHeight/2-40); // надпись restart
            game.scoreCounter.saveScore();
            pipes.length = 0;
        } else {
            requestAnimationFrame(this.draw.bind(this, bckgrnd, bird, pipes));
        }
    }
}

class ScoreCounter {

    constructor() {
        this.outputField = document.getElementById("score");
        this.score = 0;
        this.bestScore = 0;
        this.reset();
    }
    
    inc() {
        this.score++;
        this.displayScore();
    }

    reset() {
        this.score = 0;
        this.bestScore = localStorage.getItem("fb_bestScore");
        this.displayScore();
    }

    displayScore() {
        if (this.bestScore == undefined) {
            this.outputField.innerHTML = `Score: ${this.score}`;
        } else {
            this.outputField.innerHTML = `Score: ${this.score} | Best: ${this.bestScore}`;
        }
    }

    saveScore() {
        if (this.bestScore == undefined || this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem("fb_bestScore", this.score);
        }
    }
}

game = new Main;
game.start();

document.addEventListener('keydown', game.clickHandler.bind(game));
document.addEventListener('click', game.clickHandler.bind(game));

