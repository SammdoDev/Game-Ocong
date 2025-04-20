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
    },

    create() {
        // Deklarasikan variabel di awal
        var btnClicked = false;
        
        this.add.image(1024 / 2, 768 / 2, 'bg_start');
        var btnPlay = this.add.image(1024 / 2, 768 / 2 + 75, 'btn_play');
        this.titleGame = this.add.image(1024 / 2, 200, 'title_game');
        this.titleGame.setDepth(10);

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