import Phaser from "phaser";
import collidable from "../mixins/collidable";
import anims from "../mixins/anims";
import MeleeWeapon from "../attacks/MeleeWeapon";
import Raycaster from "./util/Raycaster";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.config = scene.config;

        Object.assign(this, collidable);
        Object.assign(this, anims);

        this.raycaster = new Raycaster(scene);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 800;
        this.speed = 50;
        this.jumpPower = -250;
        this.chaseSpeed = 150;
        this.timeFromLastTurn = 0;
        this.maxPatrolDistance = 600;
        this.currentPatrolDistance = 0;
        this.health = 40;
        this.damage = 20;
        this.body.setGravityY(500);
        this.setCollideWorldBounds(true);
        this.setOrigin(0.5, 1);
        this.setImmovable(true);
        this.chaseDirection = Phaser.Math.Between(0, 1) ? 1 : -1;
        this.setVelocityX(this.speed * this.chaseDirection);
        this.setFlipX(this.chaseDirection < 0);
        this.platformCollidersLayer = null;
        this.player = null;
        this.isPlayerDetected = false;
        this.isChasing = false;
        this.chaseStartTime = 0;
        this.chaseDuration = 5000;
        this.isStopped = false;
        this.stopTime = 0;
        this.stopDuration = 1000;
        this.detectionRange = 400; // 플레이어 감지 범위
        this.attackRange = 50; // 공격 가능 범위 (가까운 거리)
        this.jumpRandom = 30;
        this.jumpCount = 0;
        this.maxJumpCount = 1;
        this.attackAnimKey = "default-attack"; // 애니메이션 키를 동적으로 설정 가능
        this.attackDuration = 500;
        this.attackEndTime = 0;
        this.attackDelay = 0; // 애니메이션 시작 후 무기 활성화 지연 시간

        this.lastRaycastTime = 0;
        this.raycastInterval = 200;

        this.lastAttackTime = 0;
        this.attackCooldown = 1000;

        // 무기 크기 및 오프셋 설정
        this.meleeWeaponWidth = 600;
        this.meleeWeaponHeight = 40;
        this.meleeWeaponOffsetX = 10; // 예: 오른쪽으로 10픽셀 이동
        this.meleeWeaponOffsetY = -20; // 예: 위로 20픽셀 이동

        // MeleeWeapon 재생성 또는 업데이트
        this.meleeWeapon = new MeleeWeapon(
            this.scene,
            0,
            0,
            this.attackAnimKey,
            this.meleeWeaponWidth,
            this.meleeWeaponHeight,
            this.meleeWeaponOffsetX,
            this.meleeWeaponOffsetY
        );
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time, delta) {
        if (this.getBounds().bottom > 600) {
            this.destroy();
            return;
        }

        if (this.body.onFloor()) {
            this.jumpCount = 0;
        }

        this.patrol(time);

        if (time > this.lastRaycastTime + this.raycastInterval) {
            this.playerRaycast(time);
            this.lastRaycastTime = time;
        }

        if (this.isStopped && time > this.stopTime + this.stopDuration) {
            console.log("1초 대기 후 순찰 재개! (추적 방향 유지)");
            this.isStopped = false;
            this.setVelocityX(this.speed * this.chaseDirection);
            this.setFlipX(this.chaseDirection < 0);
        }

        if (this.attackEndTime > 0 && time >= this.attackEndTime) {
            this.meleeWeapon.activateWeapon(false);
            this.meleeWeapon.body.checkCollision.none = false;
            this.meleeWeapon.body.reset(0, 0);
            this.attackEndTime = 0;
        }
    }

    patrol(time) {
        if (
            !this.body ||
            !this.body.onFloor() ||
            this.isChasing ||
            this.isStopped
        ) {
            return;
        }

        this.currentPatrolDistance += Math.abs(this.body.deltaX());
        const { hasHit } = this.raycaster.raycast(
            this.body,
            this.platformCollidersLayer
        );

        if (
            (!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) &&
            this.timeFromLastTurn + 100 < time
        ) {
            this.chaseDirection = -this.chaseDirection;
            this.setFlipX(this.chaseDirection < 0);
            this.setVelocityX(this.speed * this.chaseDirection);
            this.timeFromLastTurn = time;
            this.currentPatrolDistance = 0;
        }
    }

    attack(time, attackDelay = this.attackDelay) {
        if (time < this.lastAttackTime + this.attackCooldown) {
            return;
        }

        // 공격 애니메이션 재생
        this.play(this.attackAnimKey, true);

        // 애니메이션 완료 시 무기 비활성화 (필요 시)
        this.once("animationcomplete", () => {
            if (this.meleeWeapon.active) {
                this.meleeWeapon.activateWeapon(false);
                this.meleeWeapon.body.checkCollision.none = false;
                this.meleeWeapon.body.reset(0, 0);
            }
        });

        // attackDelay 후에 무기 활성화
        this.scene.time.delayedCall(attackDelay, () => {
            this.meleeWeapon.swing(this, this.player, attackDelay);
            this.attackEndTime = time + this.attackDuration + attackDelay;
        });

        this.lastAttackTime = time;
    }

    playerRaycast(time) {
        if (!this.player) {
            return;
        }

        const { hasHitFar } = this.raycaster.checkPlayerRaycast(
            this.body,
            this.player,
            {
                raylength: this.detectionRange,
            },
            this.flipX
        );

        // 플레이어와의 거리 계산
        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.x,
            this.y,
            this.player.x,
            this.player.y
        );

        if (hasHitFar) {
            if (!this.isPlayerDetected) {
                console.log("플레이어 감지됨! 추적 시작.");
                this.isPlayerDetected = true;
                this.isChasing = true;
                this.isStopped = false;
                this.chaseStartTime = time;
            } else if (this.isChasing) {
                this.chaseStartTime = time;
            }

            // 공격 범위 내에 있을 때만 공격
            if (distanceToPlayer <= this.attackRange) {
                // 플레이어 감지 시 공격
                this.attack(time);
            }
        } else if (this.isPlayerDetected) {
            console.log("플레이어 감지 해제됨!");
            this.isPlayerDetected = false;
        }

        if (this.isChasing) {
            if (time > this.chaseStartTime + this.chaseDuration) {
                console.log("추적 시간 종료! 멈춤.");
                this.isChasing = false;
                this.isStopped = true;
                this.stopTime = time;
                this.setVelocityX(0);
            } else {
                this.chasePlayer();
            }
        }
    }

    chasePlayer() {
        if (!this.player || !this.body) {
            return;
        }

        const playerX = this.player.x;
        const enemyX = this.x;
        const playerY = this.player.y;
        const enemyY = this.y;

        if (playerX < enemyX) {
            this.setVelocityX(-this.chaseSpeed);
            this.setFlipX(true);
            this.chaseDirection = -1;
        } else if (playerX > enemyX) {
            this.setVelocityX(this.chaseSpeed);
            this.setFlipX(false);
            this.chaseDirection = 1;
        }

        if (playerY < enemyY - 20 && this.jumpCount < this.maxJumpCount) {
            const jumpChance = Phaser.Math.Between(0, 100);
            if (jumpChance < this.jumpRandom) {
                this.setVelocityY(this.jumpPower);
                this.jumpCount += 1;
            }
        }
    }

    setPlatformColliders(platformCollidersLayer) {
        this.platformCollidersLayer = platformCollidersLayer;
    }

    setPlayer(player) {
        this.player = player;
    }

    takesHit(source) {
        source.deliversHit(this);
        this.health -= source.damage;
        console.log("Enemy health: ", this.health);

        if (this.health <= 0) {
            this.setTint(0xff0000);
            this.setVelocity(0, -200);
            this.body.checkCollision.none = true;
            this.setCollideWorldBounds(false);
            this.destroy();
        }
    }

    destroy() {
        this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        this.raycaster.destroy();
        this.meleeWeapon.destroy();
        super.destroy();
    }
}

export default Enemy;
