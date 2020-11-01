var config = {
    type: Phaser.AUTO,
    width: window.screen.width - 5,
    height: window.screen.height - 20,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var PLAYER_SPEED = 900;
var BEAN_SPEED = 300;
var jrdVelocity = 300;

var beanScore = 0;
var waifuHealth = 10;
var beanWin = 20;

var waifu;
var face;
var cauldron;
var keyInput;
var playerRails = { right: null, left: null };
var screenCenter;
var projectiles;
var lastBeanShot;
var beanInterval;

// Sounds
var naniSound;
var beanShotSound1;
var beanShotSound2;
var uwuSound;
var chikiBrikiSound;
var popSound;
var loseSound;
var winSound;


var game = new Phaser.Game(config);

// Util Functions
function genRandInt(min, max) {
     return Math.floor(Math.random() * (max - min) + min);
 }

 function createBean() {
     return class Bean extends Phaser.Physics.Arcade.Sprite {
        constructor(scene, x, y) {
            super(scene, x, y, 'bean');
            this.speed = Phaser.Math.GetSpeed(BEAN_SPEED, 1);
            this.direction = [1, -1][Math.floor(2 * Math.random())];
        }

        fire(x, y) {
            this.setPosition(x, y);
            this.setActive(true);
            this.setVisible(true);
        }

        update(time, delta) {
            this.x += ((this.speed * this.direction) * delta);

            if (this.x >= config.width || this.x < 0) {
                this.setActive(false);
                this.setVisible(false)
            }
        }
    }
 }


//  Game Loop Functions
function preload() {
    // Images
    this.load.image('bg', 'assets/bg.jpg');
    this.load.image('player', 'assets/player.png');
    this.load.image('face', 'assets/jrd.png');
    this.load.image('bean', 'assets/bean.png');
    this.load.image('pot', 'assets/pot.png');

    // Audio
    this.load.audio('naniSound', 'assets/nani.mp3');
    this.load.audio('beanShotSound1', 'assets/bean1.mp3');
    this.load.audio('beanShotSound2', 'assets/bean2.mp3');
    this.load.audio('uwuSound', 'assets/uwu.mp3');
    this.load.audio('chikiSound', 'assets/chikiBriki.mp3');
    this.load.audio('popSound', 'assets/pop.mp3');
    this.load.audio('loseSound', 'assets/waimu.mp3');
    this.load.audio('winSound', 'assets/winSound.mp3');

};

function create() {

    this.add.image(config.width / 2, config.height / 2, 'bg');

    projectiles = this.physics.add.group({
        classType: createBean(),
        maxSize: 30,
        runChildUpdate: true,
    });

    // Sounds
    beanShotSound1 = this.sound.add('beanShotSound1');
    beanShotSound2 = this.sound.add('beanShotSound2');
    naniSound = this.sound.add('naniSound');
    uwuSound = this.sound.add('uwuSound');
    chikiBrikiSound = this.sound.add('chikiSound');
    popSound = this.sound.add('popSound');
    loseSound = this.sound.add('loseSound');
    winSound = this.sound.add('winSound');

    playerRails.left = 130;
    playerRails.right = config.width - 130;
    screenCenter = config.height / 2;

    waifu = this.physics.add.sprite(playerRails.left, screenCenter, 'player');
    waifu.setCollideWorldBounds(true);

    cauldron = this.physics.add.sprite(playerRails.right, screenCenter, 'pot');
    cauldron.setCollideWorldBounds(true);
    cauldron.setScale(0.2);

    face = this.physics.add.sprite(config.width / 2, config.height / 2, 'face');
    face.setScale(2);
    face.setCollideWorldBounds(true);
    face.setVelocityY(jrdVelocity);

    keyInput = this.input.keyboard.createCursorKeys();
    beanInterval = genRandInt(500, 2000);

    this.physics.add.collider(waifu, projectiles, function (waifu, projectiles) {
        waifuHealth -= 1;
        uwuSound.play();
        console.log(`[waifu health] ${waifuHealth}`);
        projectiles.destroy();
        if (waifuHealth <= 0) {
            console.log("gameOver");
            loseSound.play();
        }
    });

    this.physics.add.collider(cauldron, projectiles, function (cauldron, projectiles) {
        beanScore += 1;
        popSound.play();
        console.log(`[bean score] ${beanScore}`);
        projectiles.destroy();
        if (beanScore % 5 === 0) {
            chikiBrikiSound.play();
        }
        if (beanScore >= beanWin) {
            console.log("win");
            winSound.play();
        }
    });

};

function update() {


    if (face.body.velocity.y === 0) {
        jrdVelocity *= -1;
        face.body.velocity.y = jrdVelocity;
    }

    if (keyInput.up.isDown) {
        waifu.setVelocity(0, PLAYER_SPEED * -1);
        cauldron.setVelocity(0, PLAYER_SPEED * -1);
    }
    else if (keyInput.down.isDown) {
        waifu.setVelocity(0, PLAYER_SPEED);
        cauldron.setVelocity(0, PLAYER_SPEED);
    } else {
        waifu.setVelocity(0);
        cauldron.setVelocity(0);
    }
    if (Phaser.Input.Keyboard.JustDown(keyInput.space)) {
        naniSound.play();
        if (waifu.x == playerRails.left) {
            waifu.x = playerRails.right;
            cauldron.x = playerRails.left;
        }
        else {
            waifu.x = playerRails.left;
            cauldron.x = playerRails.right;
        }
    }
    if (!lastBeanShot || new Date() - lastBeanShot > beanInterval) {
        var bean = projectiles.get();
        bean.setScale(0.09);

        if (bean) {
            bean.fire(face.x, face.y);
        }
        lastBeanShot = new Date();
        beanInterval = genRandInt(500, 2000);
        [beanShotSound2, beanShotSound1][Math.floor(2 * Math.random())].play()
    }
};