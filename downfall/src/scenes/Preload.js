import Phaser from "phaser";

class Preload extends Phaser.Scene {
    constructor() {
        super("PreloadScene");
    }

    preload() {
        this.load.tilemapTiledJSON('test_land', 'assets/test_land.json');
        this.load.image("tiles-1", "./assets/main_lev_build_1.png");
        this.load.image("test_player", "./assets/bird.png");
        this.load.image("sky", "./assets/sky.jpg");

        this.load.image("mountain_tile", "./assets/mountain.png");


        this.load.spritesheet('birdman', 'assets/enemy/enemy_sheet.png', { frameWidth: 32, frameHeight: 64, spacing: 32 });

        this.load.spritesheet('orc-idle', 'assets/enemy/orc/orc_idle.png', { frameWidth: 96, frameHeight: 96});
        this.load.spritesheet('orc-run', 'assets/enemy/orc/orc_run.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('orc-attack', 'assets/enemy/orc/orc_attack.png', { frameWidth: 96, frameHeight: 96 });
        this.load.spritesheet('orc-walk', 'assets/enemy/orc/orc_walk.png', { frameWidth: 96, frameHeight: 96 });



        this.load.once('complete', () => {
            this.startGame()
        })
    }

    startGame() {
        console.log("startGame")
        this.scene.start('PlayScene')
    }

    // create() {
    //     this.scene.start("PlayScene");
    // }
}

export default Preload;