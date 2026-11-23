import { CharacterId } from '../config/animations';
import { computeMinCenterSeparation, getFighterSpacingConfig } from '../config/fighterSpacing';
import { GAME_CONFIG } from '../config/game';
import { StageConfig } from '../config/stages';

export interface PhysicsBody {
  x: number;
  y: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 1 | -1;
  characterId?: CharacterId;
}

export class PhysicsEngine {
  static integrateBody(
    body: PhysicsBody,
    stage: StageConfig,
    dt: number,
    horizontalFriction = 1600,
  ): { landed: boolean } {
    let landed = false;

    body.x += body.vx * dt;

    if (!body.isGrounded || body.vy < 0) {
      body.vy += GAME_CONFIG.gravity * dt;
      body.y += body.vy * dt;

      if (body.y >= stage.groundY) {
        body.y = stage.groundY;
        body.vy = 0;
        if (!body.isGrounded) {
          landed = true;
        }
        body.isGrounded = true;
      } else {
        body.isGrounded = false;
      }
    } else {
      body.y = stage.groundY;
      // Apply horizontal damping when grounded
      if (horizontalFriction > 0 && Math.abs(body.vx) > 0) {
        const sign = Math.sign(body.vx);
        const mag = Math.max(0, Math.abs(body.vx) - horizontalFriction * dt);
        body.vx = sign * mag;
      }
    }

    // Clamp to stage boundaries
    if (body.x < stage.leftBound) {
      body.x = stage.leftBound;
      if (body.vx < 0) body.vx = 0;
    } else if (body.x > stage.rightBound) {
      body.x = stage.rightBound;
      if (body.vx > 0) body.vx = 0;
    }

    return { landed };
  }

  /**
   * Corner-safe, jitter-free fighter pushbox solver.
   *
   * - Uses per-character pushbox widths + minimum body gap when characterIds are present,
   *   or an explicit `minSeparation` override for unit tests.
   * - Prevents sprites from overlapping, walking through each other, or stacking in corners:
   *   when one fighter is pinned at a stage edge, 100% of remaining separation is resolved onto
   *   the non-cornered fighter.
   * - Cancels opposing inward horizontal velocity cleanly at contact to prevent jitter/oscillation.
   * - Still allows clean jump-overs when vertical altitude gap exceeds 225px.
   */
  static resolveFighterPushbox(
    a: PhysicsBody,
    b: PhysicsBody,
    stage: StageConfig,
    minSeparation?: number,
    maxCameraSpan = 1660,
  ): void {
    const resolvedMinSep =
      minSeparation ??
      (a.characterId && b.characterId
        ? computeMinCenterSeparation(a.characterId, b.characterId)
        : GAME_CONFIG.fighterPushWidth);

    const strength =
      a.characterId && b.characterId
        ? Math.min(
            1,
            Math.max(
              0.6,
              (getFighterSpacingConfig(a.characterId).pushboxSeparationStrength +
                getFighterSpacingConfig(b.characterId).pushboxSeparationStrength) *
                0.5,
            ),
          )
        : 1.0;

    // Only apply horizontal pushbox when vertical distance overlaps (allows clean jump-overs)
    const verticalGap = Math.abs(a.y - b.y);
    if (verticalGap < 225) {
      const dx = b.x - a.x;
      const dist = Math.abs(dx);

      if (dist < resolvedMinSep) {
        // Stable separation direction: preserve side ordering (never flip sides at x === x)
        let dir: 1 | -1;
        if (Math.abs(dx) > 0.001) {
          dir = dx > 0 ? 1 : -1;
        } else {
          // Tie-breaker: push away from whichever stage edge is closer, or respect facing
          const midStage = (stage.leftBound + stage.rightBound) * 0.5;
          dir = a.x <= midStage ? 1 : -1;
        }

        const totalOverlap = (resolvedMinSep - dist) * strength;
        const leftFighter = dir === 1 ? a : b;
        const rightFighter = dir === 1 ? b : a;

        // Determine available room before stage boundaries
        const leftRoom = Math.max(0, leftFighter.x - stage.leftBound);
        const rightRoom = Math.max(0, stage.rightBound - rightFighter.x);

        const half = totalOverlap * 0.5;
        let moveLeft = Math.min(half, leftRoom);
        let moveRight = Math.min(half, rightRoom);

        // Corner transfer: if one fighter is against a wall, shift remaining separation to the other
        const remaining = totalOverlap - (moveLeft + moveRight);
        if (remaining > 0.001) {
          if (leftRoom - moveLeft > 0.001) {
            moveLeft += Math.min(remaining, leftRoom - moveLeft);
          } else if (rightRoom - moveRight > 0.001) {
            moveRight += Math.min(remaining, rightRoom - moveRight);
          }
        }

        leftFighter.x -= moveLeft;
        rightFighter.x += moveRight;

        // Cancel opposing inward velocities at pushbox contact to stop jitter & sliding overlap
        if (leftFighter.vx > 0 && rightFighter.vx <= 0) {
          leftFighter.vx = 0;
        }
        if (rightFighter.vx < 0 && leftFighter.vx >= 0) {
          rightFighter.vx = 0;
        }
        // If one fighter is cornered, cancel the aggressor's push velocity into the corner
        if (leftFighter.x <= stage.leftBound + 1 && rightFighter.vx < 0) {
          rightFighter.vx = 0;
        }
        if (rightFighter.x >= stage.rightBound - 1 && leftFighter.vx > 0) {
          leftFighter.vx = 0;
        }
      }
    }

    // Keep fighters within maxCameraSpan so both remain comfortably visible in the 1920px viewport
    const distAfter = Math.abs(b.x - a.x);
    if (distAfter > maxCameraSpan) {
      const excess = (distAfter - maxCameraSpan) * 0.5;
      const dir = b.x >= a.x ? 1 : -1;
      a.x += dir * excess;
      b.x -= dir * excess;
    }

    // Final stage boundary clamp
    a.x = Math.max(stage.leftBound, Math.min(stage.rightBound, a.x));
    b.x = Math.max(stage.leftBound, Math.min(stage.rightBound, b.x));
  }
}
