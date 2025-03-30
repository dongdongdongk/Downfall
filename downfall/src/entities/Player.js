import Phaser from "phaser";
import collidable from "../mixins/collidable";

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "test_player");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        Object.assign(this, collidable);

        this.init();
        this.initEvents();
    }


    init() {
        this.hasBeenHit = false;
        this.bounceVelocity = 200;
        this.gravity = 900;
        this.playerSpeed = 200;
        this.jumpCount = 0;
        this.consecutiveJumps = 1;
        this.body.setSize(20, 36);
        this.jumpSpeed = -350;
        this.isSliding = false;
        this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        this.body.setGravityY(500);
        this.setCollideWorldBounds(true);
        this.cursors = this.scene.input.keyboard.createCursorKeys();

        this.setOrigin(0.5, 1);
        this.health = 100;

    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update() {
        if (this.hasBeenHit || this.isSliding || !this.body) {
            return;
        }

        const { left, right, space } = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        // const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);
        const onFloor = this.body.onFloor();

        if (left.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
        } else if (right.isDown) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
        } else {
            this.setVelocityX(0);
        }

        if (
            isSpaceJustDown &&
            (onFloor || this.jumpCount < this.consecutiveJumps)
        ) {
            this.setVelocityY(this.jumpSpeed);
            this.jumpCount++;
        }

        if (onFloor) {
            this.jumpCount = 0;
        }
    }

    takesHit(source) {
        if (this.hasBeenHit) {
            return;
        }

        this.health -= source.damage || 0;
        console.log("Player got hit, health:", this.health);

        this.hasBeenHit = true;
        const bounceVelocity = source.bounceVelocity || this.bounceVelocity; // MeleeWeapon에서 값 가져오기
        this.bounceOff(source, bounceVelocity); // 수정된 bounceOff 호출
        const hitAnim = this.playDamageTween();

        this.scene.time.delayedCall(500, () => {
            this.hasBeenHit = false;
            hitAnim.stop();
            this.clearTint();
        });
    }

    playDamageTween() {
        return this.scene.tweens.add({
            targets: this,
            duration: 50,
            repeat: -1,
            tint: 0xff0000,
            yoyo: true,
        });
    }

    bounceOff(source, bounceVelocity) {
        // source와 플레이어의 상대적 위치로 방향 결정
        const direction = source.x < this.x ? 1 : -1; // source가 왼쪽에 있으면 오른쪽(1), 오른쪽에 있으면 왼쪽(-1)
        const xVelocity = bounceVelocity * direction;
        const yVelocity = -bounceVelocity; // 항상 위로 튕김

        this.setVelocity(xVelocity, yVelocity);
        console.log(`Bounce direction: ${direction}, X: ${xVelocity}, Y: ${yVelocity}`);
    }

}

export default Player;