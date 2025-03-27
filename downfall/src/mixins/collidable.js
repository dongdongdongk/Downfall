export default {
    addColliders(otherGameObject, callback, context) {
        this.scene.physics.add.collider(this, otherGameObject, callback, null, context || this);
        return this
    },

    addOverlap(otherGameObject, callback, context) {
        this.scene.physics.add.overlap(this, otherGameObject, callback, null, context || this);
        return this
    },

    bodyPositionDifferenceX: 0,
    prevRay: null,
    prevHasHit: null,

    raycast(body, layer, { raylength = 30, precision = 0, steepnes = 1 }) {
        const { x, y, width, halfHeight } = body;
        // console.log("현재 감지 중인 레이어:", layer);

        this.bodyPositionDifferenceX += body.x - body.prev.x;

        if ((Math.abs(this.bodyPositionDifferenceX) <= precision) && this.prevHasHit !== null ) {
            return {
                ray: this.prevRay,       // 이전 레이 값 그대로 반환
                hasHit: this.prevHasHit   // 이전 충돌 결과 그대로 반환
            }
        }

        const line = new Phaser.Geom.Line();
        let hasHit = false;
        
        switch(body.facing) {
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
  
        const hits = layer.getTilesWithinShape(line);

        // console.log("감지된 타일:", hits);
        // console.log("타일 인덱스 값:", hits.map(hit => hit.index));
        if (hits.length > 0) {
            hasHit = this.prevHasHit = hits.some(hit => hit.index !== -1);
            this.prevHasHit = null
        }

        this.prevRay = line;
        this.bodyPositionDifferenceX = 0;
        
        // console.log("레이케스트")
        return { ray: line, hasHit }

    },

    checkPlayerRaycast(body, player, { raylength = 200 } = {}) {
        const { x, y, width, halfHeight } = body;
        const line = new Phaser.Geom.Line();
        let hasHitFar = false;
    
        // 적의 방향에 따라 레이 방향 설정
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
    
        // 플레이어와의 충돌 확인
        const playerBounds = player.getBounds();
        if (Phaser.Geom.Intersects.LineToRectangle(line, playerBounds)) {
            // 레이가 플레이어와 교차하면 감지된 것으로 간주
            hasHitFar = true;
        }
    
        // 플랫폼 레이어와의 충돌 확인 (장애물 체크)
        if (this.platformCollidersLayer) {
            const hits = this.platformCollidersLayer.getTilesWithinShape(line);
            if (hits.some(hit => hit.index !== -1)) {
                // 장애물이 있으면 플레이어를 감지하지 않음
                hasHitFar = false;
            }
        }
    
        return { rayFar: line, hasHitFar };
    }
    
}