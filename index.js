(() => {
    class Timer {
        constructor(timeLimit, callback) {
            this.timeLimit = timeLimit;
            this.timerNode = document.querySelector('.timer');
            this.timeLeft = timeLimit;
            this.callback = callback;
        }

        displayTime() {
            this.timeLeft = this.timeLeft - 1;
            this.timerNode.textContent = this.timeLeft;
        }

        start() {
            this.timeLeft = this.timeLimit;
            this.run();
        }
        run() {
            clearInterval(this.interval);
            this.interval = null;
            this.interval = setInterval(() => {
                if (this.timeLeft === 0) {
                    this.callback();
                    clearInterval(this.interval);
                    this.interval = null;
                } else {
                    this.displayTime();
                }
            }, 1000);
        }

        stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }
    }

    class Card {
        constructor({ number, callBack }) {
            this.element = document.createElement('div');
            this.number = number;
            this.element.dataset.number = number;
            this.element.textContent = number;
            this.element.className = 'card';
            this.active = false;
            this.callback = callBack;
            this.bindEvent();
        }

        setActive(active) {
            this.active = active;
            this.element.dataset.active = active;
        }

        clickCard() {
            const isActive = this.active;

            if (isActive) {
                return null;
            }

            this.setActive(true);

            this.callback(this);
        }

        bindEvent() {
            const animation = anime({
                targets: this.element,
                rotateY: [{ value: '360deg', duration: 400 }],
                autoplay: false,
            });

            this.element.addEventListener('click', () => {
                console.log('pla');
                animation.play();
                console.log('pl2a');
                this.clickCard();
            });
        }
    }

    class Message {
        constructor() {
            this.container = document.querySelector('.message');
        }
        hide() {
            anime({
                targets: '.message',
                translateY: '-200px',
                scale: [{ value: 1.3, duration: 400 }],
                easing: 'easeInOutQuad',
            });
        }

        show(message, time = 3000) {
            this.container.textContent = message;
            anime({
                targets: '.message',
                translateY: '100px',
                scale: [{ value: 1.3, duration: 400 }],
                easing: 'easeInOutQuad',
            });
            setTimeout(() => {
                this.hide();
            }, time);
        }
    }

    class Grid {
        constructor(args) {
            this.width = args.width;
            this.height = args.height;
            this.cols = args.cols;
            this.rows = args.rows;
            this.theme = args.theme;
            this.clickCard = args.clickCard;
            this.container = document.querySelector('.grid');
            this.init();
        }

        init() {
            this.createGrid();
            this.createCards();
            this.shuffleCards();
        }

        createGrid() {
            if (this.theme) {
                Object.assign(this.container.style, this.theme);
            }
            let grid = '';

            for (let i = 0; i < this.cols; i++) {
                grid = `${grid} 1fr`;
            }
            this.container.style.width = `${this.width}px`;
            this.container.style.height = `${this.width}px`;
            this.container.style.gridTemplateColumns = grid;
        }

        createCards() {
            const odd = (this.rows * this.cols) % 2 === 0;
            const count = Math.floor((this.rows * this.cols) / 2);

            const onlyNumbers = Array.apply(null, Array(count)).map((x, i) => i + 1);

            const doubled = odd
                ? [...onlyNumbers, ...onlyNumbers]
                : [...onlyNumbers, ...onlyNumbers, 'end'];

            this.cards = doubled.map((el) => new Card({ number: el, callBack: this.clickCard }));
        }

        shuffleCards() {
            for (let i = this.cards.length - 1; i >= 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));

                [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
            }
            this.cards.forEach((el) => {
                el.setActive(false);
                this.container.appendChild(el.element);
            });
        }

        show() {
            this.container.classList.add('show');
        }

        hide() {
            this.container.classList.remove('show');
        }
    }

    class Game {
        constructor(args) {
            this.result = {};
            this.active = null;
            this.message = new Message();
            this.grid = new Grid({
                width: args.width,
                height: args.height,
                cols: args.cols,
                rows: args.rows,
                theme: args.theme,
                clickCard: this.clickCard.bind(this),
            });
            this.timer = new Timer(args.timeLimit, this.lose.bind(this));

            this.timerListeners();
        }

        async showForTime(time) {
            this.grid.show();
            return await new Promise((res) =>
                setTimeout(() => {
                    this.grid.hide();
                    return res();
                }, time),
            );
        }

        async start() {
            this.active = null;
            this.result = {};
            this.message.hide();
            this.grid.shuffleCards();
            await this.showForTime(2000);
            this.timer.start();
        }

        async end(message) {
            this.message.show(message);
            this.timer.stop();
            this.grid.show();
        }

        checkWin() {
            const keys = Object.keys(this.result);
            const odd = this.grid.cards.length % 2 === 0;
            const count = Math.floor(this.grid.cards.length / 2);

            if (odd) {
                if (keys.length === count) {
                    this.win();
                }
            } else {
                if (keys.length === count + 1) {
                    this.win();
                }
            }
        }

        win() {
            this.end('You Win !');
        }
        lose() {
            this.end('You Lose !');
        }

        async clickCard(card) {
            const value = card.number;

            if (!this.active) {
                this.result[value] = [value];
                this.active = value;
            } else {
                if (this.active === value) {
                    this.result[value] = [...this.result[value], value];
                    this.active = null;
                } else {
                    return this.lose();
                }
            }
            this.checkWin();
        }

        timerListeners() {
            this.grid.container.addEventListener('mouseleave', () => {
                this.timer.stop();
            });

            this.grid.container.addEventListener('mouseover', () => {
                this.timer.run();
            });
        }
    }

    const firstPage = document.querySelector('.first-page');
    const startButton = document.querySelector('.start-button');
    const gamePage = document.querySelector('.second-page');

    startButton.addEventListener('click', () => {
        firstPage.style.display = 'none';
        gamePage.style.display = 'flex';
        showGame();
    });

    const showGame = () => {
        const restart = document.querySelector('.restart-button');

        const game = new Game({
            width: 500,
            height: 500,
            cols: 3,
            rows: 2,
            timeLimit: 20,
            theme: {
                background: 'rgb(145, 140, 144)',
                color: 'white',
                fontSize: '30px',
            },
        });
        const anim = anime({
            targets: '.card',
            translateY: -1000,
            direction: 'reverse',
            easing: 'easeInOutSine',
            delay: anime.stagger(100),
        });
        anim.finished.then(() => {});

        game.start();

        restart.addEventListener('click', () => {
            game.start();
        });
    };
})();
