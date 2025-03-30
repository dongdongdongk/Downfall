import Phaser from "phaser";
import { ENEMY_TYPES } from "../types";
import collidable from "../mixins/collidable";

class Enemies extends Phaser.GameObjects.Group {
    constructor(scene) {
        super(scene);

        Object.assign(this, collidable);
    }

    getProjectiles() {
        const projectiles = new Phaser.GameObjects.Group();
        this.getChildren().forEach(enemy => {
            enemy.projectiles && projectiles.addMultiple(enemy.projectiles.getChildren());
        });
        return projectiles;
    }

    // MeleeWeapon 수집 메서드 추가
    getMeleeWeapons() {
        const meleeWeapons = new Phaser.GameObjects.Group();
        this.getChildren().forEach(enemy => {
            if (enemy.meleeWeapon) {
                meleeWeapons.add(enemy.meleeWeapon);
            }
        });
        return meleeWeapons;
    }



    getTypes() {
        return ENEMY_TYPES();
    }
}


export default Enemies;