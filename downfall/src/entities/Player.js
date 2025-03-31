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
        this.defenseKey = this.scene.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.F
        );

        this.setOrigin(0.5, 1);
        this.health = 100;

        // 방어 관련 변수수
        this.isDefending = false; // 방어 상태
        this.facingRight = true; // 바라보는 방향 (true: 오른쪽, false: 왼쪽)
        this.defenseDuration = 500; // 방어 지속 시간 (0.5초)
        this.defenseCooldown = 1000; // 방어 쿨다운 (1초)
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

        // 'F' 키로 방어 활성화
        if (
            Phaser.Input.Keyboard.JustDown(this.defenseKey) &&
            time > this.lastDefenseTime + this.defenseCooldown
        ) {
            this.activateDefense(time);
        }

        // 방어 상태가 끝났는지 확인
        if (this.isDefending && time > this.defenseEndTime) {
            this.isDefending = false;
            this.setTint(0xffffff); // 방어 끝나면 원래 색상으로 (시각적 피드백 제거)
        }
    }

    activateDefense(time) {
        console.log("Player is defending!");
        this.isDefending = true;
        this.lastDefenseTime = time;
        this.defenseEndTime = time + this.defenseDuration;
        this.setTint(0x00ff00); // 방어 중임을 나타내기 위해 초록색으로 (시각적 피드백)
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
                // 방향이 일치 -> 방어 성공
                source.deliversHit && source.deliversHit(this, true); // 방어 이펙트
                this.scene.cameras.main.shake(200, 0.001);

                return; // 방어 성공 시 종료
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
