// Menu Scene
var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function () {
        Phaser.Scene.call(this, { key: 'sceneMenu' });
    },
    init() {},
    preload() {
        this.load.image('bg_start', '/assets/images/bg_start.png');
        this.load.image('btn_play', '/assets/images/btn_play.png');
        this.load.image('title_game', '/assets/images/title_game.png');
        this.load.image('panel_skor', '/assets/images/panel_skor.png');
        
        // Load ambience sound
        this.load.audio('snd_ambience', '/assets/audio/ambience.mp3');
    },
    
    create() {
        var btnClicked = false;
        
        // Add ambience background sound
        if(!this.sound.get('snd_ambience')) {
            this.snd_ambience = this.sound.add('snd_ambience');
            this.snd_ambience.loop = true;
            this.snd_ambience.setVolume(0.35);
            this.snd_ambience.play();
        }
        
        this.add.image(1024 / 2, 768 / 2, 'bg_start');
        var btnPlay = this.add.image(1024 / 2, 768 / 2 + 75, 'btn_play');
        this.titleGame = this.add.image(1024 / 2, 200, 'title_game');
        this.titleGame.setDepth(10);
        
        var highScore = localStorage.getItem('highScore') || 0;
        
        this.scorePanel = this.add.image(180, 50, 'panel_skor');
        this.scorePanel.setDepth(5);
        
        this.highScoreLabel = this.add.text(160, 50, 'HIGH SCORE:', {
            font: '20px Arial',
            fill: '#FFFF00',
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center'
        });
        this.highScoreLabel.setOrigin(0.5, 0.5);
        this.highScoreLabel.setDepth(6);
        
        // Add high score value
        this.highScoreText = this.add.text(250, 50, highScore.toString(), {
            font: 'bold 24px Arial',
            fill: '#FFFFFF',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center'
        });
        this.highScoreText.setOrigin(0.5, 0.5);
        this.highScoreText.setDepth(6);
        
        if (highScore == 0) {
            this.highScoreText.setText('0');
        }
        
        if (highScore == 0) {
            this.centeredHighScoreText.setText('Belum ada High Score');
        }
        
        this.titleGame.y -= 384;
        
        this.tweens.add({
            targets: this.titleGame,
            ease: 'Bounce.easeOut',
            duration: 750,
            delay: 250,
            y: 200
        });
        
        btnPlay.setScale(0);
        
        this.tweens.add({
            targets: btnPlay,
            ease: 'Back.easeOut',
            duration: 750,
            delay: 250,
            scaleX: 1,
            scaleY: 1
        });
        
        this.titleGame.setScale(0);
        
        this.tweens.add({
            targets: this.titleGame,
            ease: 'Back.easeOut',
            duration: 750,
            delay: 250,
            scaleX: 1,
            scaleY: 1
        });
        
        this.input.on('gameobjectover', function (pointer, gameObject) {
            console.log('scenemenu | Object Over');
            if (!btnClicked) return;
            if (gameObject == btnPlay) {
                btnPlay.setTint(0xffff00); // Ubah warna saat hover
            }
        }, this);
        
        this.input.on('gameobjectout', function (pointer, gameObject) {
            console.log('scenemenu | Object Out');
            if (!btnClicked) return;
            if (gameObject == btnPlay) {
                btnPlay.setTint(0xffffff); // Kembalikan warna normal
            }
        }, this);
        
        this.input.on('gameobjectdown', function (pointer, gameObject) {
            console.log('scenemenu | Object Click');
            if (gameObject == btnPlay) {
                btnPlay.setTint(0xdddddd); // Ubah warna saat diklik
                btnClicked = true; // Gunakan = bukan ==
            }
        }, this);
        
        this.input.on('gameobjectup', function (pointer, gameObject) {
            console.log('sceneMenu | Object End Click');
            if (gameObject == btnPlay) {
                btnPlay.setTint(0xffffff);
                this.scene.start('scenePlay');
            }
        }, this);
        
        this.input.on('pointerup', function (pointer, gameObject) {
            console.log('scenemenu | Mouse Up');
            btnClicked = false; // Gunakan = bukan ==
        }, this);
        
        btnPlay.setInteractive();
    },
    
    update() {}
});