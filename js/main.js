$(document).ready(function() {

    // Particle class
    class Particles {
        static initClass() {
            this.prototype.defaults = {
                speed: 1.8,
                radius: 15,
                //innerColor: '#252359',
                //outerColor: '#0E0D26',
                //aroundColor: '#252359',
                //innerColorHero: '#F279C8',
                //outerColorHero: '#BF1765',
                //aroundColorHero: '#F279C8',
                innerColor: '#F279C8',
                outerColor: '#BF1765',
                aroundColor: '#F279C8',
                innerColorHero: '#252359',
                outerColorHero: '#0E0D26',
                aroundColorHero: '#252359',
                aroundme: false,
                speedAroundMe: 1,
                offsetAroundMe: 0,
                hero: false,
                onCreate: function() {},
                onDead: function() {}
            };
        }

        constructor(canvas, options) {
            Particles.initClass();

            this.options = $.extend({}, this.defaults, options);

            let timeout;
            let random;
            let startAngle;
            let progress;
            let direction;
            let currentRadius;
            let oldx;
            let oldy;
            let x;
            let y;
            let w;
            let h;

            // Set default value
            this.canvas = canvas;
            this.timeout = false;
            this.random = Math.random();
            this.startAngle = this.random * 360;
            this.w = 0;
            this.h = 0;
            this.progress = 0;
            this.direction = 0;
            this.currentRadius = 0;

            if (this.options.hero) {
                this.options.offsetAroudme = 10;
            }

            // Init dimensions
            this.getWindowDimensions();

            // Initial position
            this.x = Math.floor(Math.random() * this.w);
            this.y = Math.floor(Math.random() * this.h);

            // init Behaviours
            this.behaviours();
            this.options.onCreate(this.options);
        }

        behaviours() {
            // window.resize event listener
            window.addEventListener('resize', function() {
                this.getWindowDimensions()
            }.bind(this));
        }

        render() {
            this.drawFirstParticle();
            this.drawSecondParticleAroundMe();
            this.nextPosition();
            this.progress++;
        }

        drawFirstParticle() {
            // Set current dimension radius
            this.currentRadius = Math.min(this.progress / 2, this.options.radius);
            // GRADIENT
            let gradient = this.canvas.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.currentRadius);
            if (this.options.hero == true) {
                gradient.addColorStop(0, this.options.innerColorHero);
                gradient.addColorStop(1, this.options.outerColorHero);
            } else {
                gradient.addColorStop(0, this.options.innerColor);
                gradient.addColorStop(1, this.options.outerColor);
            }

            // Draw first circle
            this.canvas.beginPath();
            this.canvas.arc(this.x, this.y, this.currentRadius, 0, 2 * Math.PI);
            this.canvas.lineWidth = 1;
            this.canvas.fillStyle = gradient;
            this.canvas.fill();
            this.canvas.closePath();
            return;
        }

        drawSecondParticleAroundMe() {
            if (!this.options.aroundme) return;

            let color = this.options.hero == true ? this.options.aroundColorHero : this.options.aroundColor;;
            let angle = (this.progress * this.options.speedAroudme + this.startAngle) * Math.PI / 180;
            let x = this.x + Math.cos(angle) * (this.currentRadius - 1 + this.options.offsetAroudme);
            let y = this.y + Math.sin(angle) * (this.currentRadius - 1 + this.options.offsetAroudme);

            if (this.oldx) {
                this.canvas.beginPath();
                this.canvas.moveTo(this.oldx, this.oldy);
                this.canvas.lineTo(x, y);
                this.canvas.strokeStyle = color;
                this.canvas.lineWidth = 1;
                this.canvas.stroke();
            }

            this.oldx = x;
            this.oldy = y;

            return;
        }

        nextPosition() {
            this.x += Math.cos(this.direction) * this.options.speed;
            this.y += Math.sin(this.direction) * this.options.speed;
            this.direction += Math.random() * 0.7 - 0.32;
            return;
        }

        move() {
            this.render();
            return this.isInBound();
        }

        isInBound() {
            if (
                this.x < -this.options.radius ||
                this.x > this.w + this.options.radius ||
                this.y < -this.options.radius ||
                this.y > this.h + this.options.radius
            ) {
                this.options.onDead(this.options);
                return false;
            }
            return true;
        }

        getWindowDimensions() {
            this.w = window.innerWidth;
            this.h = window.innerHeight;
        }
    }

    // Canvas
    let bodyCanvas = document.createElement('canvas');
    $("body").append(bodyCanvas);
    let canvas = bodyCanvas.getContext('2d');

    // Configuration
    let config = {
        maxParticles: 100,
        maxHeros: 24,
        speedAroudme: 3,
        offsetAroudme: 1
    }

    let dimensions = {
        width: 0,
        height: 0
    }

    let heros = 0;
    let data_particles = [];

    // function setWindowSize()
    function setWindowSize() {
        dimensions.width = $(window).width();
        dimensions.height = $(window).height();
        bodyCanvas.width = dimensions.width;
        bodyCanvas.height = dimensions.height;
    }

    // function Populate
    function populate(num) {
        for (var i = 0; i < num; i++) {
            let isHero = false;
            if (heros < config.maxHeros) {
                isHero = true;
            }
            data_particles.push(new Particles(canvas, {
                speed: .95,
                radius: Math.round(18 + (Math.random() * 30)),
                aroundme: true,
                hero: isHero,
                speedAroudme: config.speedAroudme,
                offsetAroudme: config.offsetAroudme,
                onCreate: function(data) {
                    if (data.hero == true) {
                        heros++;
                    }
                },
                onDead: function(data) {
                    if (data.hero == true) {
                        heros--;
                    }
                }
            }))
        }
        return data_particles.length
    }

    // function Clear
    function clear() {
        canvas.globalAlpha = 0.016;
        canvas.fillStyle = '#181719';
        canvas.fillRect(0, 0, dimensions.width, dimensions.height);
        canvas.globalAlpha = 1;
    }


    // function Update
    function update() {
        clear();
        data_particles = data_particles.filter(function(p) {
            return p.move()
        })
        if (data_particles.length < config.maxParticles) {
            populate(1)
        }
        requestAnimationFrame(update)
    }

    setWindowSize();
    populate(config.maxParticles);
    update();

    $(window).resize(setWindowSize);
})