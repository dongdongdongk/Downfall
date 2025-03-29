import Enemy from "./Enemy";
import initAnims from "./anims/orcAnims";

class Orc extends Enemy {
    constructor(scene, x, y) {
        super(scene, x, y, "orc");
        initAnims(scene.anims);
    }

    init() {
        super.init();
        this.setSize(20, 45);
        this.setOffset(40, 50);
        this.setScale(1);
        this.attackRange = 50; // 공격 범위 (픽셀 단위)
        this.attackAnimKey = 'orc-attack';
        this.attackDuration = 500; // 공격 지속 시간 (0.5초)
        this.attackEndTime = 0; // 공격이 끝나는 시간
        this.attackCooldown = 600; // 공격 쿨다운 (1초)
        this.lastAttackTime = 0; // 마지막 공격 시간
        this.attackDelay = 1000; // 공격 딜레이 (예: 0.2초 후 super.attack 호출)
    }

    update(time, delta) {
        super.update(time, delta);
        if (!this.active) {
            return;
        }

        // 피격 상태 체크
        if (this.isPlayingAnims('birdman-hurt')) { // 'birdman-hurt'를 'orc-hurt'로 수정 필요
            return;
        }

        // 사망 상태 체크
        if (this.health <= 0) {
            this.play('birdman-die', true); // 'birdman-die'를 'orc-die'로 수정 필요
            return;
        }

        // 공격 중이면 이동 로직 건너뛰기
        if (this.isPlayingAnims(this.attackAnimKey)) {
            this.setVelocityX(0); // 공격 중에는 이동 멈춤
            return;
        }

        // 플레이어와의 거리 체크 및 상태에 따른 애니메이션
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
            } else if (this.isChasing) {
                this.play('orc-run', true); // 추적 중이면 달리기
            } else if (this.isStopped === false) {
                this.play('orc-walk', true); // patrol 상태이면 걷기
            } else {
                this.play('orc-idle', true); // 멈춘 상태이면 idle
            }
        } else {
            this.play('orc-walk', true); // 플레이어가 없으면 기본적으로 patrol 상태로 간주
        }
    }

    attack(time) {
        if (time < this.lastAttackTime + this.attackCooldown) {
            return;
        }

        console.log('Orc swoops down to attack!');
        this.play(this.attackAnimKey, false);
        this.setVelocityX(0);
        super.attack(time); // Enemy의 attack 호출 (attackDelay 적용)
    }

    takesHit(source) {
        super.takesHit(source);
        this.play('orc-hurt', true); // 'birdman-hurt' 대신 'orc-hurt' 사용
    }

    // 애니메이션 재생 중인지 확인하는 헬퍼 메서드
    isPlayingAnims(animKey) {
        return this.anims.isPlaying && this.anims.currentAnim.key === animKey;
    }
}

export default Orc;