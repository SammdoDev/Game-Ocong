// Play Scene
var scenePlay = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: "scenePlay" });
  },

  init: function () {
    // Detect if on mobile device
    this.isMobile =
      this.sys.game.device.os.android ||
      this.sys.game.device.os.iOS ||
      this.sys.game.device.os.windowsPhone;

    // Store screen dimensions
    this.screenWidth = this.sys.game.config.width;
    this.screenHeight = this.sys.game.config.height;
  },

  preload() {
    this.load.image("chara", "assets/images/chara.png");
    this.load.image("fg_loop_back", "assets/images/fg_loop_back.png");
    this.load.image("fg_loop", "assets/images/fg_loop.png");
    this.load.image("obstacle", "assets/images/obstacle.png");
    this.load.image("panel_skor", "assets/images/panel_skor.png");
    this.load.audio("snd_dead", "assets/audio/dead.mp3");
    this.load.audio("snd_klik_1", "assets/audio/klik_1.mp3");
    this.load.audio("snd_klik_2", "assets/audio/klik_2.mp3");
    this.load.audio("snd_klik_3", "assets/audio/klik_3.mp3");
  },

  create: function () {
    this.snd_dead = this.sound.add("snd_dead");

    this.snd_click = [];
    this.snd_click.push(this.sound.add("snd_klik_1"));
    this.snd_click.push(this.sound.add("snd_klik_2"));
    this.snd_click.push(this.sound.add("snd_klik_3"));

    for (let i = 0; i < this.snd_click.length; i++) {
      this.snd_click[i].setVolume(0.5);
    }

    // Inisialisasi score
    this.score = 0;

    // Tambahkan panel skor - pindahkan ke posisi yang lebih terlihat
    this.panel_skor = this.add.image(180, 50, "panel_skor");
    this.panel_skor.setDepth(10);

    // Tambahkan text skor - pastikan warnanya kontras dengan panel
    this.label_score = this.add.text(100, 50, this.score, {
      font: "32px Arial",
      fill: "#ffffff",
      align: "center",
    });
    this.label_score.setOrigin(0.5);
    this.label_score.setDepth(11);

    console.log(
      "Panel skor dibuat di posisi:",
      this.panel_skor.x,
      this.panel_skor.y
    );

    this.halangan = [];
    this.timerHalangan = 60;

    this.moveUp = false;
    this.moveDown = false;
    this.moveSpeed = 10; // Kecepatan gerak karakter
    this.flyingSpeed = 3; // Kecepatan karakter terbang ke atas secara otomatis

    this.chara = this.add.image(130, 768 / 2, "chara");
    this.chara.setDepth(5);
    this.chara.setScale(0);

    var myScene = this;

    this.tweens.add({
      targets: this.chara,
      ease: "Back.easeOut",
      duration: 750,
      delay: 250,
      scaleX: 1,
      scaleY: 1,
      onComplete: function () {
        myScene.isGameRunning = true;

        // Show mobile instructions if on mobile
        if (myScene.isMobile) {
          myScene.showMobileInstructions();
        }
      },
    });

    // Kontrol keyboard untuk gerakan yang lebih baik
    this.cursors = this.input.keyboard.createCursorKeys();

    // ============== MOBILE CONTROLS START ================
    if (this.isMobile) {
      // For mobile: Setup touch zones for better control
      this.setupMobileControls();

      // Add orientation change handler
      window.addEventListener("orientationchange", () => {
        this.checkOrientation();
      });

      // Initial orientation check
      this.checkOrientation();
    } else {
      // Original mouse/touch controls for non-mobile
      this.setupOriginalControls();
    }
    // ============== MOBILE CONTROLS END ================

    this.background = [];

    var bg_x = 1366 / 6;

    for (let i = 0; i < 2; i++) {
      var bg_awal = [];

      var BG = this.add.image(bg_x, 768 / 2, "fg_loop_back");
      var FG = this.add.image(bg_x, 768 / 2, "fg_loop");

      BG.setData("kecepatan", 2);
      FG.setData("kecepatan", 4);
      FG.setDepth(2);

      bg_awal.push(BG);
      bg_awal.push(FG);

      this.background.push(bg_awal);

      bg_x += 1366;
    }
  },

  setupMobileControls: function () {
    // Buat zona sentuh di bagian bawah layar untuk kontrol naik dan turun
    // Jadi di bagian bawah layar dibagi 2 area: kiri untuk naik, kanan untuk turun

    let halfWidth = this.screenWidth / 2;
    let bottomZoneHeight = this.screenHeight * 0.25; // Contoh, 25% layar bagian bawah

    // Zona untuk naik (kiri bawah)
    this.upZone = this.add
      .zone(
        0,
        this.screenHeight - bottomZoneHeight,
        halfWidth,
        bottomZoneHeight
      )
      .setOrigin(0)
      .setInteractive();

    // Zona untuk turun (kanan bawah)
    this.downZone = this.add
      .zone(
        halfWidth,
        this.screenHeight - bottomZoneHeight,
        halfWidth,
        bottomZoneHeight
      )
      .setOrigin(0)
      .setInteractive();

    // Pointer down pada zona naik
    this.upZone.on("pointerdown", () => {
      if (!this.isGameRunning) return;
      this.moveUp = true;
      this.moveDown = false;
    });

    // Pointer down pada zona turun
    this.downZone.on("pointerdown", () => {
      if (!this.isGameRunning) return;
      this.moveUp = false;
      this.moveDown = true;
    });

    // Reset movement saat pointer up di mana saja
    this.input.on("pointerup", () => {
      if (!this.isGameRunning) return;
      this.moveUp = false;
      this.moveDown = false;

      // Play click sound
      if (this.snd_click.length > 0) {
        this.snd_click[
          Math.floor(Math.random() * this.snd_click.length)
        ].play();
      }
    });

    console.log("Mobile bottom screen controls set up");
  },

  setupOriginalControls: function () {
    // Kontrol mouse/touch original
    this.input.on(
      "pointerdown",
      function (pointer) {
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
      },
      this
    );

    this.input.on(
      "pointerup",
      function (pointer, currentlyOver) {
        if (!this.isGameRunning) return;

        // Reset movement flags
        this.moveUp = false;
        this.moveDown = false;

        // Play random click sound
        this.snd_click[
          Math.floor(Math.random() * this.snd_click.length)
        ].play();
      },
      this
    );
  },

  // Swipe handling methods
  startSwipe: function (pointer) {
    this.swipeCoordX = pointer.x;
    this.swipeCoordY = pointer.y;
    this.isSwipe = true;
  },

  moveSwipe: function (pointer) {
    if (!this.isSwipe || !this.isMobile) return;

    // Calculate swipe distance
    let swipeDistY = pointer.y - this.swipeCoordY;

    // Detect significant vertical swipe
    if (Math.abs(swipeDistY) > this.swipeThreshold) {
      if (swipeDistY < 0) {
        // Swipe up - stronger upward movement
        this.moveUp = true;
        this.moveDown = false;
      } else {
        // Swipe down - stronger downward movement
        this.moveUp = false;
        this.moveDown = true;
      }

      // Update start position for continued swiping
      this.swipeCoordY = pointer.y;
    }
  },

  // Check device orientation and show warning if needed (mobile only)
  checkOrientation: function () {
    if (!this.isMobile) return;

    // For mobile, recommend landscape mode
    if (window.orientation === 0 || window.orientation === 180) {
      // Portrait
      this.showOrientationWarning();
    } else {
      this.hideOrientationWarning();
    }
  },

  // Show orientation warning
  showOrientationWarning: function () {
    if (!this.orientationOverlay) {
      // Pause game while in wrong orientation
      this.isPaused = true;

      // Add overlay
      this.orientationOverlay = this.add.rectangle(
        this.screenWidth / 2,
        this.screenHeight / 2,
        this.screenWidth,
        this.screenHeight,
        0x000000,
        0.8
      );
      this.orientationOverlay.setDepth(30);

      // Add text
      this.orientationText = this.add
        .text(
          this.screenWidth / 2,
          this.screenHeight / 2,
          "PLEASE ROTATE\nYOUR DEVICE",
          {
            font: "32px Arial",
            fill: "#ffffff",
            align: "center",
          }
        )
        .setOrigin(0.5)
        .setDepth(31);
    }
  },

  // Hide orientation warning
  hideOrientationWarning: function () {
    if (this.orientationOverlay) {
      this.orientationOverlay.destroy();
      this.orientationText.destroy();
      this.orientationOverlay = null;
      this.orientationText = null;

      // Resume game
      this.isPaused = false;
    }
  },

  // Show mobile control instructions
  showMobileInstructions: function () {
    // Instructions for mobile users
    this.instructionText = this.add
      .text(
        this.screenWidth / 2,
        this.screenHeight / 2,
        "TAP TOP HALF: UP\nTAP BOTTOM HALF: DOWN",
        {
          font: "28px Arial",
          fill: "#ffffff",
          stroke: "#000000",
          strokeThickness: 4,
          align: "center",
        }
      )
      .setOrigin(0.5)
      .setDepth(20);

    // Fade out after a few seconds
    this.tweens.add({
      targets: this.instructionText,
      alpha: 0,
      duration: 1000,
      delay: 3000,
      onComplete: () => {
        if (this.instructionText) this.instructionText.destroy();
      },
    });
  },

  // Mobile-specific game over feedback
  mobileFeedback: function () {
    // Vibrate device if supported (mobile feedback)
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  },
  // ================ MOBILE METHODS END ===================

  createHalangan: function () {
    if (this.timerHalangan <= 0) {
      this.timerHalangan = 60;

      var acak_y = Math.floor(Math.random() * 600 + 60);

      var halanganBaru = this.add.image(1500, acak_y, "obstacle");

      halanganBaru.setOrigin(0.5);
      halanganBaru.setData("status_aktif", true);
      halanganBaru.setData("kecepatan", Math.floor(Math.random() * 15 + 10));
      halanganBaru.setDepth(5);

      this.halangan.push(halanganBaru);

      this.timerHalangan = Math.floor(Math.random() * 50 + 10);
    }
  },

  updateHalangan: function () {
    for (let i = this.halangan.length - 1; i >= 0; i--) {
      this.halangan[i].x -= this.halangan[i].getData("kecepatan");

      if (this.halangan[i].x < -200) {
        this.halangan[i].destroy();
        this.halangan.splice(i, 1);
        break;
      }
    }

    this.timerHalangan--;
  },

  checkCollision: function () {
    for (var i = this.halangan.length - 1; i >= 0; i--) {
      // Jika posisi halangan 50 lebih kecil dari karakter dan status halangan masih aktif
      if (
        this.chara.x > this.halangan[i].x + 50 &&
        this.halangan[i].getData("status_aktif") == true
      ) {
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

  // Define gameOver method properly outside the update method
  gameOver: function () {
    console.log("Game Over function called");

    // Add mobile-specific feedback
    if (this.isMobile) {
      this.mobileFeedback();
    }

    // Save high score to local storage
    var highScore = localStorage.getItem("highScore") || 0;
    if (this.score > highScore) {
      localStorage.setItem("highScore", this.score);
      console.log("New high score saved:", this.score);
    }

    // Return to menu scene
    this.scene.start("sceneMenu");
  },

  update: function () {
    // Skip update if paused (for orientation warnings)
    if (this.isPaused) return;

    if (this.isGameRunning) {
      // Karakter terus terbang ke atas secara otomatis
      this.chara.y -= this.flyingSpeed;

      // Ganti pergerakan otomatis dengan input kontrol
      if (this.cursors.up.isDown || this.moveUp) {
        this.chara.y -= this.moveSpeed; // Bergerak lebih cepat ke atas
      } else if (this.cursors.down.isDown || this.moveDown) {
        this.chara.y += this.moveSpeed + this.flyingSpeed; // Bergerak ke bawah, melawan gravitasi
      }

      // Batasi posisi karakter agar tidak keluar layar
      if (this.chara.y < 100) this.chara.y = 100;
      if (this.chara.y > 690) this.chara.y = 690;

      for (let i = 0; i < this.background.length; i++) {
        for (let j = 0; j < this.background[i].length; j++) {
          this.background[i][j].x -= this.background[i][j].getData("kecepatan");

          if (this.background[i][j].x <= -(1366 / 2)) {
            var diff = this.background[i][j].x + 1366 / 2;
            this.background[i][j].x = 1366 + diff;
          }
        }
      }

      // Create and update obstacles
      this.createHalangan();
      this.updateHalangan();
      this.checkCollision();

      // Check for collisions with obstacles
      for (let i = this.halangan.length - 1; i >= 0; i--) {
        // Use Phaser's built-in intersection method for better collision detection
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.chara.getBounds(),
            this.halangan[i].getBounds()
          )
        ) {
          console.log("Collision detected!");

          // Mark obstacle as inactive
          this.halangan[i].setData("status_aktif", false);

          // Stop the game
          this.isGameRunning = false;

          this.snd_dead.play();

          // Stop any existing tweens on character
          if (this.charaTweens != null) {
            this.charaTweens.stop();
          }

          // Store reference to 'this' for use in the callback
          var self = this;

          // Start scaling down animation
          this.tweens.add({
            targets: this.chara,
            ease: "Back.easeIn",
            duration: 750,
            delay: 250,
            scaleX: 0,
            scaleY: 0,
            onComplete: function () {
              // Call the gameOver method with proper context
              self.gameOver();
            },
          });

          break;
        }
      }
    }
  },
});
