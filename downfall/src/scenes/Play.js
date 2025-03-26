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
    }


    createMap() {
        const map = this.make.tilemap({key:'test_land'});
        map.addTilesetImage('main_lev_build_1','tiles-1')
        return map;
    }

    createLayers(map) {
        const tileset = map.getTileset("main_lev_build_1");
        const test_layer = map.createStaticLayer('test_layer', tileset)

        const playerZones = map.getObjectLayer("player_zones");

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
}

export default Play