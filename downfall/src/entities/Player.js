import Phaser from "phaser";
import collidable from "../mixins/collidable";
import initAnimations from "./anims/PlayerAnims";
import anims from "../mixins/anims";


class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, "idle");

        scene.add.existing(this);
        scene.physics.add.existing(this);

        Object.assign(this, collidable);
        Object.assign(this, anims);
        


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
        this.body.setSize(18, 36);
        this.jumpSpeed = -250;
        this.isSliding = false;
        this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
        this.body.setGravityY(500);
        this.setCollideWorldBounds(true);


        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.defenseKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        this.setScale(1.4);
        this.setDepth(3)
        this.body.setOffset(46, 45);
        this.setOrigin(0.5, 1);
        this.health = 100;

        initAnimations(this.scene.anims);

        // 방어 관련 변수수
        this.isDefending = false; // 방어 상태
        this.facingRight = true; // 바라보는 방향 (true: 오른쪽, false: 왼쪽)
        this.defenseDuration = 1000; // 방어 지속 시간 (0.5초)
        this.defenseCooldown = 1200; // 방어 쿨다운 (1초)
        this.lastDefenseTime = 0; // 마지막 방어 시간
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time) {
        if (this.hasBeenHit || this.isSliding || !this.body) {
            return;
        }

        const { left, right, space } = this.cursors;
        const isSpaceJustDown = Phaser.Input.Keyboard.JustDown(space);
        // const isUpJustDown = Phaser.Input.Keyboard.JustDown(up);
        const onFloor = this.body.onFloor();

        if (left.isDown && !this.isDefending) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_LEFT;
            this.setVelocityX(-this.playerSpeed);
            this.setFlipX(true);
            this.body.setOffset(56, 45); // 왼쪽 방향 오프셋
        } else if (right.isDown && !this.isDefending) {
            this.lastDirection = Phaser.Physics.Arcade.FACING_RIGHT;
            this.setVelocityX(this.playerSpeed);
            this.setFlipX(false);
            this.body.setOffset(46, 45);
        } else {
            this.setVelocityX(0);
            // 정지 시 마지막 방향에 따라 오프셋 유지
            this.body.setOffset(this.flipX ? 56 : 46, 45);
        }

        if (
            isSpaceJustDown &&
            (onFloor || this.jumpCount < this.consecutiveJumps && !this.isDefending)
        ) {
            this.setVelocityY(this.jumpSpeed);
            this.jumpCount++;
        }

        if (onFloor) {
            this.jumpCount = 0;
        }

        if (this.isPlayingAnims("guardSuccess")) {
            return;
        }

        // 방어 로직
        if (this.defenseKey.isDown && time > this.lastDefenseTime + this.defenseCooldown) {
            this.activateDefense(time);
        } else if (this.defenseKey.isUp && this.isDefending) {
            this.deactivateDefense();
        }

        // 애니메이션 처리
        if (this.isDefending) {
            this.setVelocityX(0); // 방어 중 이동 멈춤
            this.play("guard", true); // guard 애니메이션 유지
        } else if (onFloor) {
            this.body.velocity.x !== 0
                ? this.play("run", true)
                : this.play("idle", true);
        } else {
            if (this.body.velocity.y < 0) {
                this.play("jump", true);
            } else if (this.body.velocity.y > 0) {
                this.play("fall", true);
            }
        }

    }

    activateDefense(time) {
        if (!this.isDefending) {
            console.log("Player is defending!");
            this.isDefending = true;
            this.lastDefenseTime = time; // 방어 시작 시점 기록 (쿨다운용)
        }
    }

    deactivateDefense() {
        console.log("Defense deactivated!");
        this.isDefending = false;
    }

    takesHit(source) {
        if (this.hasBeenHit) {
            return;
        }

        let damageTaken = false;

        if (this.isDefending) {
            const bounceVelocity = source.bounceVelocity || this.bounceVelocity;
            this.bounceOff(source, bounceVelocity);

            // flipX가 false면 오른쪽, true면 왼쪽을 보고 있음
            const attackFromRight = source.x > this.x;

            // 방어 성공 조건: 방향이 일치해야 함
            if (!this.flipX && !attackFromRight) {
                // 오른쪽을 보고 있고 왼쪽에서 공격 -> 방어 실패
                this.health -= source.damage || 0;
                damageTaken = true;
                source.deliversHit && source.deliversHit(this, false); // 혈흔 이펙트
            } else if (this.flipX && attackFromRight) {
                // 왼쪽을 보고 있고 오른쪽에서 공격 -> 방어 실패
                this.health -= source.damage || 0;
                damageTaken = true;
                source.deliversHit && source.deliversHit(this, false); // 혈흔 이펙트
            } else {
                // 방어 성공
                this.scene.cameras.main.shake(200, 0.001);
                source.deliversHit && source.deliversHit(this, true);
                this.setTint(0xffffff); // 하얀색 번쩍임
                this.play("guardSuccess", true); // guardSuccess 애니메이션 재생
                this.scene.time.delayedCall(500, () => {
                    this.clearTint(); // 원래 색상으로 복귀
                    if (this.isDefending) {
                        this.play("guard", true); // 방어 중이면 guard로 돌아감
                    }
                });
                return;
            }
        } else {
            // 방어 중이 아닌 경우
            this.health -= source.damage || 0;
            damageTaken = true;
            source.deliversHit && source.deliversHit(this, false); // 혈흔 이펙트
        }

        // 이후 데미지 처리 로직 (방어 실패 시만 실행)
        this.hasBeenHit = true;
        const bounceVelocity = source.bounceVelocity || this.bounceVelocity;
        this.bounceOff(source, bounceVelocity);
        this.setTexture("hit");
        const hitAnim = this.playDamageTween();

        if (damageTaken) {
            this.scene.cameras.main.shake(200, 0.005);
        }

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
        console.log(
            `Bounce direction: ${direction}, X: ${xVelocity}, Y: ${yVelocity}`
        );
    }
}

export default Player;
