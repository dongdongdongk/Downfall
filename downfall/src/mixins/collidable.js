export default {
    addColliders(otherGameObject, callback, context) {
        this.scene.physics.add.collider(this, otherGameObject, callback, null, context || this);
        return this
    },

    addOverlap(otherGameObject, callback, context) {
        this.scene.physics.add.overlap(this, otherGameObject, callback, null, context || this);
        return this
    }
}