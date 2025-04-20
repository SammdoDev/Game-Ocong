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
    },

    create: function () {
        this.chara = this.add.image(130, 768/2, 'chara');
        this.chara.setDepth(2);

        this.chara.setScale(0);

        this.tweens.add({
            targets: this.chara,
            ease: 'Back.easeOut',
            duration: 750,
            delay: 250,
            scaleX: 1,
            scaleY: 1
        });
    },

    update: function () {
        console.log('scenePlay | update');
    }
});