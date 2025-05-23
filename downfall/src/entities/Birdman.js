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
        this.attackAnimKey = 'birdman-attack';
        this.attackDuration = 500; // 공격 지속 시간 (0.5초)
        this.attackEndTime = 0; // 공격이 끝나는 시간
        this.attackCooldown = 1000; // 공격 쿨다운 (1초)
        this.lastAttackTime = 0; // 마지막 공격 시간
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

        // 공격 중이면 이동 로직 건너뛰기
        if (this.isPlayingAnims(this.attackAnimKey)) {
            this.setVelocityX(0); // 공격 중에는 이동 멈춤
            return; // 추가 로직 실행 안 함
        }

        // 플레이어와의 거리 체크 및 공격 트리거
        if (this.player) {
            const distanceToPlayer = Phaser.Math.Distance.Between(
                this.x, this.y,
                this.player.x, this.player.y
            );

            if (
                distanceToPlayer <= this.attackRange &&
                this.isChasing &&
                !this.isPlayingAnims(this.attackAnimKey)
            ) {
                this.attack(time);
            } else if (!this.isPlayingAnims(this.attackAnimKey)) {
                this.play('birdman-idle', true); // 공격 중이 아니면 기본 애니메이션
            }
        } else {
            this.play('birdman-idle', true);
        }
    }

    attack(time) {
        if (time < this.lastAttackTime + this.attackCooldown) {
            return; // 쿨다운 중이면 공격하지 않음
        }

        console.log('Birdman swoops down to attack!');
        this.play(this.attackAnimKey, true);
        this.setVelocityX(0); // 공격 시작 시 이동 멈춤
        super.attack(time); // Enemy의 attack 호출 (swing 포함)
        this.attackEndTime = time + this.attackDuration;
        this.lastAttackTime = time; // 쿨다운 갱신
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