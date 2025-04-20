var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function () {
        Phaser.Scene.call(this, { key: "scenePlay" });
    },

    init: function () {},

    preload() {
        this.load.image('chara', '/assets/images/chara.png');
        this.load.image('fg_loop_back', '/assets/images/fg_loop_back.png');
        this.load.image('fg_loop', '/assets/images/fg_loop.png');
        this.load.image('obstacle', '/assets/images/obstacle.png'); 
        this.load.image('panel_skor', '/assets/images/panel_skor.png'); 
    },

    create: function () {
        // Inisialisasi score
        this.score = 0;

        // Tambahkan panel skor - pindahkan ke posisi yang lebih terlihat
        this.panel_skor = this.add.image(120, 80, 'panel_skor');
        this.panel_skor.setDepth(10);

        // Tambahkan text skor - pastikan warnanya kontras dengan panel
        this.label_score = this.add.text(120, 80, this.score, {
            font: '32px Arial',
            fill: '#ffffff',
            align: 'center'
        });
        this.label_score.setOrigin(0.5);
        this.label_score.setDepth(11);

        // Debugging untuk memastikan panel terlihat
        console.log("Panel skor dibuat di posisi:", this.panel_skor.x, this.panel_skor.y);

        this.halangan = [];
        this.timerHalangan = 60;

        // Inisialisasi variabel kontrol
        this.moveUp = false;
        this.moveDown = false;
        this.moveSpeed = 10; // Kecepatan gerak karakter

        this.chara = this.add.image(130, 768/2, 'chara');
        this.chara.setDepth(5);
        this.chara.setScale(0);

        var myScene = this;

        this.tweens.add({
            targets: this.chara,
            ease: 'Back.easeOut',
            duration: 750,
            delay: 250,
            scaleX: 1,
            scaleY: 1,
            onComplete: function () {
               myScene.isGameRunning = true;
            }
        });

        // Kontrol keyboard untuk gerakan yang lebih baik
        this.cursors = this.input.keyboard.createCursorKeys();

        // Kontrol mouse/touch
        this.input.on('pointerdown', function(pointer) {
            // Jika klik di bagian atas karakter, gerak ke atas
            if (pointer.y < this.chara.y) {
                this.moveUp = true;
                this.moveDown = false;
            } 
            // Jika klik di bagian bawah karakter, gerak ke bawah
            else {
                this.moveUp = false;
                this.moveDown = true;
            }
        }, this);

        this.input.on('pointerup', function() {
            this.moveUp = false;
            this.moveDown = false;
        }, this);

        this.background = [];

        var bg_x = 1366 / 6;

        for (let i = 0; i < 2; i++){
            var bg_awal = [];

            var BG = this.add.image(bg_x, 768/2, 'fg_loop_back');
            var FG = this.add.image(bg_x, 768/2, 'fg_loop');

            BG.setData('kecepatan', 2);
            FG.setData('kecepatan', 4);
            FG.setDepth(2);

            bg_awal.push(BG);
            bg_awal.push(FG);

            this.background.push(bg_awal);

            bg_x += 1366;
        }
    },

    createHalangan: function() {
        if(this.timerHalangan <= 0) {
            this.timerHalangan = 60;
            
            var acak_y = Math.floor((Math.random() * 600) + 60);
            
            var halanganBaru = this.add.image(1500, acak_y, 'obstacle');
            
            halanganBaru.setOrigin(0.5);
            halanganBaru.setData('status_aktif', true);
            halanganBaru.setData('kecepatan', Math.floor((Math.random() * 15) + 10));
            halanganBaru.setDepth(5);
            
            this.halangan.push(halanganBaru);
            
            this.timerHalangan = Math.floor((Math.random() * 50) + 10);
        }
    },

    updateHalangan: function() {
        for(let i = this.halangan.length - 1; i >= 0; i--) {
            this.halangan[i].x -= this.halangan[i].getData('kecepatan');
            
            if(this.halangan[i].x < -200) {
                this.halangan[i].destroy();
                this.halangan.splice(i, 1);
                break;
            }
        }
        
        this.timerHalangan--;
    },

    checkCollision: function() {
        for(var i = this.halangan.length - 1; i >= 0; i--) {
            // Jika posisi halangan 50 lebih kecil dari karakter dan status halangan masih aktif
            if(this.chara.x > this.halangan[i].x + 50 && this.halangan[i].getData("status_aktif") == true) {
                // Akan menandai halangan sebagai tidak aktif
                this.halangan[i].setData("status_aktif", false);
                // Tambahkan nilai sebanyak 1 poin
                this.score++;
                // Ubah text label menjadi nilai terbaru
                this.label_score.setText(this.score);
                console.log("Skor bertambah:", this.score);
            }
        }
    },

    update: function () {
        if(this.isGameRunning){
            // Ganti pergerakan otomatis dengan input kontrol
            if (this.cursors.up.isDown || this.moveUp) {
                this.chara.y -= this.moveSpeed;
            } 
            else if (this.cursors.down.isDown || this.moveDown) {
                this.chara.y += this.moveSpeed;
            }

            // Batasi posisi karakter agar tidak keluar layar
            if(this.chara.y < 100) this.chara.y = 100;
            if(this.chara.y > 690) this.chara.y = 690;

            for(let i = 0; i < this.background.length; i++){
                for(let j = 0; j < this.background[i].length; j++){
                    this.background[i][j].x -= this.background[i][j].getData('kecepatan');

                    if(this.background[i][j].x <= -(1366/2)){
                        var diff = this.background[i][j].x + (1366/2);
                        this.background[i][j].x = 1366 + diff;
                    }
                }
            }

            this.createHalangan();
            this.updateHalangan();
            this.checkCollision();
        }
    }
});