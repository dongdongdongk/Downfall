import Phaser from "phaser";
import collidable from "../mixins/collidable";
import anims from "../mixins/anims";
import MeleeWeapon from "../attacks/MeleeWeapon";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.config = scene.config;

        Object.assign(this, collidable);
        Object.assign(this, anims);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 800;
        this.speed = 50;
        this.jumpPower = -250;
        this.chaseSpeed = 150;
        this.timeFromLastTrun = 250;
        this.maxPatrolDistance = 600;
        this.currentPatrolDistance = 0;
        this.health = 40;
        this.damage = 20;
        this.body.setGravityY(500);
        this.setCollideWorldBounds(true);
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        this.setOrigin(0.5, 1);
        this.setImmovable(true);
        this.chaseDirection = Phaser.Math.Between(0, 1) ? 1 : -1; // 무작위 초기 방향
        this.setVelocityX(this.speed * this.chaseDirection); // 초기 순찰 방향
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
        this.detectionRange = 400; // 감지 범위 추가 (기본값 설정)
        this.jumpRandom = 3;
        this.jumpCount = 0; // 점프 횟수 추적
        this.maxJumpCount = 1; // 최대 점프 횟수 (1로 설정)
        this.attackAnimKey = 'default-attack'; // 기본 공격 애니메이션 키 (자식 클래스에서 오버라이드)

        this.attackDuration = 500; // 기본 공격 지속 시간 (자식 클래스에서 오버라이드 가능)
        this.attackEndTime = 0; // 공격 종료 시간

        this.meleeWeapon = new MeleeWeapon(this.scene, 0, 0, this.attackAnimKey);
        this.rayGraphics = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0xaa00aa }
        });
        this.rayGraphicsFar = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0xffff00 }
        });
    }

    initEvents() {
        this.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
    }

    update(time, delta) {
        if (this.getBounds().bottom > 600) {
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
            this.setActive(false);
            this.rayGraphics.clear();
            this.destroy();
            return;
        }

        // 착지 시 점프 횟수 초기화
        if (this.body.onFloor()) {
            this.jumpCount = 0;
        }

        this.patrol(time);
        this.playerRaycast(time);

        if (this.isStopped && time > this.stopTime + this.stopDuration) {
            console.log("1초 대기 후 순찰 재개! (추적 방향 유지)");
            this.isStopped = false;
            this.setVelocityX(this.speed * this.chaseDirection); // 추적 방향으로 순찰 재개
            this.setFlipX(this.chaseDirection < 0);
        }

        // 공격 타이머 체크
        if (this.attackEndTime > 0 && time >= this.attackEndTime) {
            this.meleeWeapon.activateWeapon(false);
            this.meleeWeapon.body.checkCollision.none = false;
            this.meleeWeapon.body.reset(0, 0);
            console.log('Melee weapon deactivated after timeout (Enemy)');
            this.attackEndTime = 0;
        }
    }

    patrol(time) {
        if (!this.body || !this.body.onFloor() || this.isChasing || this.isStopped) {
            return;
        }
        this.currentPatrolDistance += Math.abs(this.body.deltaX());
        const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer, {
            raylength: 55,
            precision: 0,
            steepnes: 0.7
        });

        if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTrun + 100 < time) {
            this.chaseDirection = -this.chaseDirection; // 방향 반전
            this.setFlipX(this.chaseDirection < 0);
            this.setVelocityX(this.speed * this.chaseDirection);
            this.timeFromLastTrun = time;
            this.currentPatrolDistance = 0;
        }

        if (this.config.debug) {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(ray);
        }
    }

    attack(time) {
        this.meleeWeapon.swing(this);
        this.attackEndTime = time + this.attackDuration; // 공격 종료 시간 설정
    }

    playerRaycast(time) {
        if (!this.player) {
            console.warn("플레이어가 설정되지 않았습니다.");
            return;
        }

        const { rayFar, hasHitFar } = this.checkPlayerRaycast(this.body, this.player, {
            raylength: this.detectionRange
        });

        if (this.config.debug) {
            this.rayGraphicsFar.clear();
            this.rayGraphicsFar.strokeLineShape(rayFar);
        }

        if (hasHitFar) {
            if (!this.isPlayerDetected) {
                console.log("플레이어 감지됨! 추적 시작.");
                this.isPlayerDetected = true;
                this.isChasing = true;
                this.isStopped = false;
                this.chaseStartTime = time; // 최초 감지 시 타이머 설정
            } else if (this.isChasing) {
                this.chaseStartTime = time; // 플레이어가 계속 감지되면 타이머 갱신
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
                this.setVelocityX(0); // 멈춤 (추적 방향은 유지됨)
            } else {
                this.chasePlayer(); // 추적 지속
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
        const jumpRandom = this.jumpRandom

        if (playerX < enemyX) {
            this.setVelocityX(-this.chaseSpeed);
            this.setFlipX(true);
            this.chaseDirection = -1; // 추적 방향 업데이트

        } else if (playerX > enemyX) {
            this.setVelocityX(this.chaseSpeed);
            this.setFlipX(false);
            this.chaseDirection = 1; // 추적 방향 업데이트
        }

        // 점프 조건: 최대 점프 횟수 미만일 때
        if (playerY < enemyY - 20 && this.jumpCount < this.maxJumpCount) {
            const jumpChance = Phaser.Math.Between(0, 100);
            if (jumpChance < jumpRandom) {
                this.setVelocityY(this.jumpPower);
                this.jumpCount += 1; // 점프 횟수 증가
                console.log("적 점프! 점프 횟수:", this.jumpCount);
            }
        }
    }

    checkPlayerRaycast(body, player, { raylength = 200 } = {}) {
        const { x, y, width, halfHeight } = body;
        const line = new Phaser.Geom.Line();
        let hasHitFar = false;

        const facingDirection = this.flipX ? Phaser.Physics.Arcade.FACING_LEFT : Phaser.Physics.Arcade.FACING_RIGHT;
        switch (facingDirection) {
            case Phaser.Physics.Arcade.FACING_RIGHT: {
                line.x1 = x + width;
                line.y1 = y + halfHeight;
                line.x2 = line.x1 + raylength;
                line.y2 = line.y1;
                break;
            }
            case Phaser.Physics.Arcade.FACING_LEFT: {
                line.x1 = x;
                line.y1 = y + halfHeight;
                line.x2 = line.x1 - raylength;
                line.y2 = line.y1;
                break;
            }
        }

        if (!player || !player.getBounds) {
            console.warn("플레이어 객체가 유효하지 않습니다.");
            return { rayFar: line, hasHitFar };
        }

        const playerBounds = player.getBounds();
        if (Phaser.Geom.Intersects.LineToRectangle(line, playerBounds)) {
            hasHitFar = true;
        }

        if (this.platformCollidersLayer) {
            const hits = this.platformCollidersLayer.getTilesWithinShape(line);
            if (hits.some(hit => hit.index !== -1)) {
                hasHitFar = false;
            }
        }

        return { rayFar: line, hasHitFar };
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
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }
    }
}

export default Enemy;