import Phaser from "phaser";

class Raycaster {
    constructor(scene) {
        this.scene = scene;
        this.rayGraphics = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0xaa00aa }
        });
        this.rayGraphicsFar = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0xffff00 }
        });
    }

    raycast(body, platformCollidersLayer, { raylength = 55, precision = 0, steepnes = 0.7 } = {}) {
        const { x, y, width, halfHeight } = body;
        const line = new Phaser.Geom.Line();
        let hasHit = false;

        const facingDirection = body.velocity.x < 0 ? Phaser.Physics.Arcade.FACING_LEFT : Phaser.Physics.Arcade.FACING_RIGHT;
        switch (facingDirection) {
            case Phaser.Physics.Arcade.FACING_RIGHT: {
                line.x1 = x + width;
                line.y1 = y + halfHeight;
                line.x2 = line.x1 + raylength * steepnes;
                line.y2 = line.y1 + raylength;
                break;
            }
            case Phaser.Physics.Arcade.FACING_LEFT: {
                line.x1 = x;
                line.y1 = y + halfHeight;
                line.x2 = line.x1 - raylength * steepnes;
                line.y2 = line.y1 + raylength;
                break;
            }
        }

        if (platformCollidersLayer) {
            const hits = platformCollidersLayer.getTilesWithinShape(line);
            if (hits.some(hit => hit.index !== -1)) {
                hasHit = true;
            }
        }

        if (this.scene.config?.debug) {
            this.rayGraphics.clear();
            this.rayGraphics.strokeLineShape(line);
        }

        return { ray: line, hasHit };
    }

    checkPlayerRaycast(body, player, { raylength = 200 } = {}, flipX) {
        const { x, y, width, halfHeight } = body;
        const line = new Phaser.Geom.Line();
        let hasHitFar = false;

        const facingDirection = flipX ? Phaser.Physics.Arcade.FACING_LEFT : Phaser.Physics.Arcade.FACING_RIGHT;
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
            return { rayFar: line, hasHitFar };
        }

        const playerBounds = player.getBounds();
        if (Phaser.Geom.Intersects.LineToRectangle(line, playerBounds)) {
            hasHitFar = true;
        }

        if (this.scene.config?.debug) {
            this.rayGraphicsFar.clear();
            this.rayGraphicsFar.strokeLineShape(line);
        }

        return { rayFar: line, hasHitFar };
    }

    destroy() {
        this.rayGraphics.destroy();
        this.rayGraphicsFar.destroy();
        this.scene = null;
    }
}

export default Raycaster;