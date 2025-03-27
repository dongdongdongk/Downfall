import Enemy from "./Enemy";
import initAnims from "./anims/birdmanAnims";

class Birdman extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "birdman");
        initAnims(scene.anims);
    }

    init() {
        super.init();
        this.setSize(20, 45);
        this.setOffset(7, 20);
        this.attackRange = 50; // 공격 범위 (픽셀 단위)
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.active) {
            return;
        }

        if (this.isPlayingAnims('birdman-hurt')) {
            return;
        }

        if (this.health <= 0) {
            this.play('birdman-die', true);
            return;
        }

        // 플레이어와의 거리 체크 및 공격 트리거
        if (this.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.player.x, this.player.y
            );

            if (distanceToPlayer <= this.attackRange && this.isChasing) {
                this.attack(); // 공격 애니메이션 플레이
            } else {
                this.play('birdman-idle', true); // 기본 애니메이션
            }
        } else {
            this.play('birdman-idle', true); // 플레이어가 없으면 기본 애니메이션
        }
    }

    attack() {
        this.play('birdman-attack', true);
    }

    takesHit(source) {
        super.takesHit(source);
        this.play('birdman-hurt', true);
    }

    // 애니메이션 재생 중인지 확인하는 헬퍼 메서드
    isPlayingAnims(animKey) {
        return this.anims.isPlaying && this.anims.currentAnim.key === animKey;
    }
}

export default Birdman;