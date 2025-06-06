import Phaser from "phaser";
import EffectManager from "../effects/EffectManager ";

class MeleeWeapon extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, animKey, width = 20, height = 40, offsetX = 0, offsetY = 0, positionOffsetX = 10, positionOffsetY = 0) {
        super(scene, x, y);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.damage = 20;
        this.attackSpeed = 1000;
        this.wielder = null;
        this.animKey = animKey;

        this.bounceVelocity = 200; // 기본 바운스 값

        // 크기 설정
        this.weaponWidth = width;   // 무기의 너비
        this.weaponHeight = height; // 무기의 높이
        this.weaponOffsetX = offsetX; // 오프셋 X
        this.weaponOffsetY = offsetY; // 오프셋 Y

        // 위치 오프셋 설정 (wielder 기준 상대적 위치)
        this.positionOffsetX = positionOffsetX; // X축 상대 위치 (기본값: 10)
        this.positionOffsetY = positionOffsetY; // Y축 상대 위치 (기본값: 0)

        this.setVisible(false);
        this.setOrigin(0.5, 1);
        this.setDepth(10);

        this.effectManager = new EffectManager(this.scene);

        // 물리 바디 크기 설정
        this.body.setSize(this.weaponWidth, this.weaponHeight);
        this.activateWeapon(false);
    }

    preUpdate(time, delta) {
        super.preUpdate(time, delta);
        if (!this.active || !this.wielder) {
            return;
        }
        // 변수로 설정된 positionOffsetX와 positionOffsetY 사용
        const xOffset = this.flipX ? -this.positionOffsetX : this.positionOffsetX;
        this.body.reset(this.wielder.x + xOffset, this.wielder.y + this.positionOffsetY);
    }

    swing(wielder, player, attackDelay) {
        this.wielder = wielder;
        if (player) {
            const wielderX = wielder.x;
            const playerX = player.x;
            if (playerX > wielderX) {
                this.setFlipX(false);
            } else {
                this.setFlipX(true);
            }
        }

        // 무기 활성화
        this.activateWeapon(true);
        console.log(`MeleeWeapon activated for ${this.animKey} with size ${this.weaponWidth}x${this.weaponHeight} after delay: ${attackDelay}`);
    }

    deliversHit(target, isDefending) {
        const impactPosition = { x: this.x -20, y: this.getCenter().y -20 };
        const effectOptions = { flipX: this.flipX };
    
        if (isDefending) {
            this.effectManager.playEffectOn('block', target, impactPosition, effectOptions);
            return;
        }
    
            // blood, blood2, blood3 배열에서 랜덤 선택
        const effects = ['blood', 'blood2', 'blood3'];
        const randomEffect = effects[Math.floor(Math.random() * effects.length)];
        this.effectManager.playEffectOn(randomEffect, target, impactPosition, effectOptions);
        this.body.checkCollision.none = true;
    }

    activateWeapon(isActive) {
        this.setActive(isActive);
        this.setVisible(isActive);
        if (isActive) {
            this.body.setSize(this.weaponWidth, this.weaponHeight); // 활성화 시 크기 재설정
        }
    }

    // 크기 업데이트 메서드 추가
    setWeaponSize(width, height) {
        this.weaponWidth = width;
        this.weaponHeight = height;
        this.body.setSize(this.weaponWidth, this.weaponHeight);
    }

    setWeaponOffset(offsetX, offsetY) {
        this.weaponOffsetX = offsetX;
        this.weaponOffsetY = offsetY;
        this.body.setOffset(this.weaponOffsetX, this.weaponOffsetY);
    }

    // 위치 오프셋 설정 메서드 추가
    setPositionOffset(positionOffsetX, positionOffsetY) {
        this.positionOffsetX = positionOffsetX;
        this.positionOffsetY = positionOffsetY;
    }
}

export default MeleeWeapon;