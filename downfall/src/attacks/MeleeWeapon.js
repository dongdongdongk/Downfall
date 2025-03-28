import Phaser from "phaser";
// import EffectManager from "../effects/EffectManager";

class MeleeWeapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, animName) {
        super(scene, x, y, animName)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.damage = 20;
        this.attackSpeed = 1000;
        this.animName = animName
        this.wielder = null;

        this.setOrigin(0.5, 1)
        this.setDepth(10)
        this.activateWeapon(false)

        // this.effectManager = new EffectManager(this.scene);

        // this.on('animationcomplete', animation => {
        //     if (animation.key === this.animName) {
        //         this.activateWeapon(false)
        //         this.body.checkCollision.none = false;
        //         this.body.reset(0,0)
        //     }
        
        // })
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta)
        if(!this.active) {
            return
        }

        if(this.wielder.lastDirection === Phaser.Physics.Arcade.FACING_RIGHT) {
            this.setFlipX(false)
            this.body.reset(this.wielder.x + 10, this.wielder.y)
        }
        else {
            this.setFlipX(true)
            this.body.reset(this.wielder.x - 10, this.wielder.y)
        }
    }

    swing(wielder) {
        this.wielder = wielder;
        this.activateWeapon(true); // 무기 활성화
    }

    deliversHit(target) {
        const impactPosition = {x: this.x, y: this.getCenter().y}
        this.effectManager.playEffectOn('hit-effect', target, impactPosition);
        this.body.checkCollision.none = true;
    }

    activateWeapon(isActive) {
        this.setActive(isActive)
        this.setVisible(isActive)
    }
}

export default MeleeWeapon