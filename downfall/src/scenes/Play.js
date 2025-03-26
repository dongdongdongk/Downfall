import Phaser from "phaser";
import Player from '../entities/Player'

class Play extends Phaser.Scene {
    constructor(config) {
        super("PlayScene");
        this.config = config;
    }

    create() {
        const map = this.createMap();
        const layers = this.createLayers(map);

        const playerZones = this.getPlayerZones(layers.playerZones);
        const player = this.createPlayer(playerZones.start);
        this.createBackgrounds(map);
        this.setupFollowupCameraOn(player);

        this.createPlayerColliders(player, {
            colliders: {
                platformsColliders: layers.test_layer,
            },
        });
    }


    createMap() {
        const map = this.make.tilemap({key:'test_land'});
        map.addTilesetImage('main_lev_build_1','tiles-1')
        map.addTilesetImage('mountain','mountain_tile')
        return map;
    }

    createLayers(map) {
        const tileset = map.getTileset("main_lev_build_1");
        const test_layer = map.createStaticLayer('test_layer', tileset)
        const playerZones = map.getObjectLayer("player_zones");

        test_layer.setCollisionByExclusion(-1, true);

        return { test_layer, playerZones };
    }

    createPlayer(start) {
        return new Player(this, start.x, start.y);
    }

    getPlayerZones(playerZonesLayer) {
        const playerZones = playerZonesLayer.objects;
        return {
            start: playerZones.find((zone) => zone.name === "startZone"),
            end: playerZones.find((zone) => zone.name === "endZone"),
        };
    }

    createPlayerColliders(player, { colliders }) {
        player
            .addColliders(colliders.platformsColliders)
    }


    createBackgrounds(map) {
        const bgObject = map.getObjectLayer('distance_bg').objects[0];
        this.mountainImage = this.add.tileSprite(bgObject.x, bgObject.y, this.config.width, bgObject.height, "mountain_tile")
        .setOrigin(0, 1)
        .setDepth(-10)
        .setScrollFactor(0, 1);


        this.skyImage = this.add.tileSprite(0, 0, this.config.width, this.config.height, "sky")
        .setOrigin(0, 0)
        .setDepth(-11)
        .setScale(1)
        .setScrollFactor(0,1);
    }

    setupFollowupCameraOn(player) {
        const { height, width, mapOffset, zoomFactor } = this.config;
        
        // 1. 게임 전체 맵의 물리적 한계를 설정
        debugger
        this.physics.world.setBounds(0, 0, width + mapOffset, height);
    
        // 2. 카메라가 이동할 수 있는 영역을 설정
        debugger
        this.cameras.main.setBounds(0, 0, width + mapOffset, height)
                         .setZoom(zoomFactor); // 줌(확대) 설정 추가
    
        // 3. 카메라가 플레이어를 따라가도록 설정
        this.cameras.main.startFollow(player);
    }

    update() {
        this.mountainImage.tilePositionX = this.cameras.main.scrollX * 0.3;
        this.skyImage.tilePositionX = this.cameras.main.scrollX * 0.1;
    }
}

export default Play