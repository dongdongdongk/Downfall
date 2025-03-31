import Phaser from "phaser";

class SpriteEffect extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, effectName, impactPosition) {
        super(scene, x, y);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.target = null;
        this.effectName = effectName;
        this.impactPosition = impactPosition;

        this.on('animationcomplete', animation => {
            if (animation.key === this.effectName) {
                this.destroy();
            }
        }, this);
    }

    preUpdate(time,delta) {
        super.preUpdate(time, delta)
        this.placeEffect();
    }

    placeEffect() {
        if (!this.target || !this.body) {
            return;
        }
        const center = this.target.getCenter();
        this.body.reset(center.x, this.impactPosition.y);
    }

    playOn(target, options = {}) {
        this.target = target;
        if (options.flipX !== undefined) {
            this.flipX = options.flipX; // 방향 설정
        }
        this.play(this.effectName);
        this.placeEffect();
    }
}


export default SpriteEffect;