import Phaser from "phaser";
// import EffectManager from "../effects/EffectManager";

class MeleeWeapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y)

        scene.add.existing(this)
        scene.physics.add.existing(this)

        this.damage = 20;
        this.attackSpeed = 1000;
        this.wielder = null;
        
        this.setVisible(false); // 스프라이트가 보이지 않도록 설정
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
        super.preUpdate(time, delta);
        if (!this.active || !this.wielder) {
            return;
        }
        // 방향 계산은 swing에서 처리하므로 여기서는 위치만 유지
        this.body.reset(this.wielder.x + (this.flipX ? -10 : 10), this.wielder.y);
    }

    swing(wielder, player, attackDelay) {
        this.wielder = wielder;
        if (player) {
            const wielderX = wielder.x;
            const playerX = player.x;
            if (playerX > wielderX) {
                this.setFlipX(false); // 플레이어가 오른쪽에 있음
            } else {
                this.setFlipX(true); // 플레이어가 왼쪽에 있음
            }
        }

        // attackDelay 후에 무기 활성화
        setTimeout(() => {
            this.activateWeapon(true);
            console.log("MeleeWeapon activated after delay:", attackDelay);
        }, attackDelay);
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