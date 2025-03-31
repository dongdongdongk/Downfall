import SpriteEffect from "./SpriteEffect";

class EffectManager {
    constructor(scene) {
        this.scene = scene;
    }

    playEffectOn(effectName, target, impactPosition, options = {}) {
        const effect = new SpriteEffect(this.scene, 0, 0, effectName, impactPosition);
        effect.playOn(target, options); // options 전달
        return effect; // 선택적
    }
}

export default EffectManager;