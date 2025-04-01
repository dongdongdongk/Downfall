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
        this.setDepth(3);
        this.body.setOffset(46, 45);
        this.setOrigin(0.5, 1);
        this.health = 100;

        initAnimations(this.scene.anims);

        // 방어 관련 변수수
        this.isDefending = false; // 방어 상태
        this.facingRight = true; // 바라보는 방향 (true: 오른쪽, false: 왼쪽)
        this.defenseDuration = 1000; // 방어 지속 시간 (0.5초)
        this.defenseCooldown = 2000; // 방어 쿨다운 (1초)
        this.lastDefenseTime = 0; // 마지막 방어 시간
        this.guardTween = null;
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time) {
        if (this.hasBeenHit || this.isSliding || !this.body) {
            return;
        }
        if(!this.isDefending) {
            this.clearTint();
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
            (onFloor || (this.jumpCount < this.consecutiveJumps && !this.isDefending))
        ) {
            this.setVelocityY(this.jumpSpeed);
            this.jumpCount++;
        }

        if (onFloor) {
            this.jumpCount = 0;
        }

        if (this.isPlayingAnims("guardSuccess") || this.isPlayingAnims("guardSuccess2")) {
            return;
        }

        // 방어 로직
        if (
            this.defenseKey.isDown &&
            time > this.lastDefenseTime + this.defenseCooldown
        ) {
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
            this.lastDefenseTime = time;

            // 방어 지속 시간 동안 깜빡이도록 트윈 시작
            if (!this.guardTween || !this.guardTween.isPlaying()) {
                this.guardTween = this.playGuardTween();
            }

            // 방어 지속 시간 후 자동 해제
            this.scene.time.delayedCall(this.defenseDuration, () => {
                if (this.isDefending) {
                    this.deactivateDefense();
                }
            });
        }
    }

    deactivateDefense() {
        console.log("Defense deactivated!");
        this.isDefending = false;
    }

    takesHit(source) {
        if (this.hasBeenHit) return;

        let damageTaken = false;
        const bounceVelocity = source.bounceVelocity || this.bounceVelocity;

        if (this.isDefending) {
            // 방어 중이면 무조건 방어 성공
            this.bounceOff(source, bounceVelocity);
            this.scene.cameras.main.shake(200, 0.003);
            source.deliversHit && source.deliversHit(this, true);

            // 50% 확률로 guardSuccess 또는 guardSuccess2 재생
            const randomChoice = Phaser.Math.Between(0, 1); // 0 또는 1 랜덤 선택
            if (randomChoice === 0) {
                console.log("Playing guardSuccess");
                this.play("guardSuccess", true);
            } else {
                console.log("Playing guardSuccess2");
                this.play("guardSuccess2", true);
            }
            this.scene.time.delayedCall(500, () => {
                // this.clearTint();
                if (this.isDefending) this.play("guard", true);
            });
            this.hasBeenHit = true; // 방어 성공 후 즉시 hasBeenHit 설정
            this.scene.time.delayedCall(200, () => {
                this.hasBeenHit = false; // 500ms 후 해제
            });
            return; // 방어 성공 시 바로 종료
        } else {
            // 방어 중이 아니면 데미지 적용
            this.health -= source.damage || 10;
            damageTaken = true;
            source.deliversHit && source.deliversHit(this, false);
            this.scene.cameras.main.flash(100, 255, 0, 0);
        }

        this.hasBeenHit = true;
        this.bounceOff(source, bounceVelocity);
        this.setTexture("hit");
        const hitAnim = this.playDamageTween();

        if (damageTaken) this.scene.cameras.main.shake(200, 0.005);

        this.scene.time.delayedCall(500, () => {
            this.hasBeenHit = false;
            hitAnim.stop();
            this.clearTint();
            this.setAlpha(1);
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

    playGuardTween() {
        const repeatCount = Math.floor(this.defenseDuration / 200);
        console.log("Guard tween started with tint: 0xffffff and alpha");
        return this.scene.tweens.add({
            targets: this,
            duration: 100, // 단일 깜빡임 시간
            repeat: repeatCount - 1, // 방어 지속 시간에 맞춘 반복 횟수
            // tint: 0x078afc, // 하얀색
            alpha: { from: 1, to: 0.5 }, // 투명도 1 -> 0.5 -> 1
            yoyo: true,
            onComplete: () => {
                this.clearTint();
                this.setAlpha(1); // 트윈 완료 시 투명도와 색상 초기화
                console.log("Guard tween completed");
            }
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
