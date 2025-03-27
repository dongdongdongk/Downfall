import Phaser from "phaser";

import collidable from "../mixins/collidable";
import anims from "../mixins/anims";

class Enemy extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, key) {
        super(scene, x, y, key);

        scene.add.existing(this);
        scene.physics.add.existing(this);
        this.config = scene.config; // 설정 값 가져오기

        Object.assign(this, collidable);
        Object.assign(this, anims);

        this.init();
        this.initEvents();
    }

    init() {
        this.gravity = 800;
        this.speed = 50;
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
        this.setVelocityX(this.speed)
        this.platformCollidersLayer = null;
        this.player = null
        this.detectionRange = 200;
        this.rayGraphics = this.scene.add.graphics({
            lineStyle: {
                width: 2,
                color: 0xaa00aa
            }
        })

        this.rayGraphicsFar = this.scene.add.graphics({
            lineStyle: {
                width: 2,
                color: 0xffff00
            }
        })

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



        this.patrol(time);
        this.playerRaycast(time);
    }

    patrol(time) {
        if (!this.body || !this.body.onFloor()) {
            return
        }
        this.currentPatrolDistance += Math.abs(this.body.deltaX());
        const { ray, hasHit } = this.raycast(this.body, this.platformCollidersLayer, {
            raylength: 55, precision: 0, steepnes: 0.7
        });
        // console.log("hasHit", hasHit)
        if ((!hasHit || this.currentPatrolDistance >= this.maxPatrolDistance) && this.timeFromLastTrun + 100 < time) {
            this.setFlipX(!this.flipX);
            this.setVelocityX(this.speed = -this.speed)
            this.timeFromLastTrun = time
            this.currentPatrolDistance = 0;
            // console.log("방향 전환")
        }
        // 디버거 모드일 때만 Raycast 표시
        if (this.config.debug) {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(ray);
        }
    }

    playerRaycast(time) {
        const { rayFar, hasHitFar } = this.checkPlayerRaycast(this.body, this.player, {
            raylength: this.detectionRange // 감지 범위 (기본값 200)
        });
    
        if (this.config.debug) {
            this.rayGraphicsFar.clear();
            this.rayGraphicsFar.strokeLineShape(rayFar);
        }
    
        // 플레이어가 감지되었는지 확인
        if (hasHitFar) { // !hasHitFar -> hasHitFar로 수정
            console.log("플레이어 감지됨!");
            // 여기서 필요한 동작 추가 (예: 추적 시작, 공격 등)
        }
    }


    setPlatformColliders(platformCollidersLayer) {
        this.platformCollidersLayer = platformCollidersLayer
    }

    setPlayer(player) {
        this.player = player
    }

    takesHit(source) {
        source.deliversHit(this);
        this.health -= source.damage;
        console.log("Enemy health: ", this.health)

        if (this.health <= 0) {
            this.setTint(0xff0000)
            this.setVelocity(0, -200)
            this.body.checkCollision.none = true;
            this.setCollideWorldBounds(false);
            this.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        }
    }
}


export default Enemy;