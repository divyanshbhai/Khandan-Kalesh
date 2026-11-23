import { StageConfig } from '../config/stages';

export class Camera {
  public x = 0;
  public shakeX = 0;
  public shakeY = 0;
  public zoom = 1;
  private trauma = 0;
  private zoomImpulse = 0;
  private reducedMotion = false;
  private minX = 0;
  private maxX = 1320;
  private viewportWidth = 1920;
  private smoothing = 11;

  setReducedMotion(reduced: boolean): void {
    this.reducedMotion = reduced;
    if (reduced) {
      this.trauma = 0;
      this.shakeX = 0;
      this.shakeY = 0;
      this.zoomImpulse = 0;
      this.zoom = 1;
    }
  }

  configure(stage: StageConfig): void {
    this.viewportWidth = stage.camera.viewportWidth;
    this.minX = stage.camera.minX;
    this.maxX = Math.max(0, stage.worldWidth - stage.camera.viewportWidth);
    this.smoothing = stage.camera.smoothing;
    this.snapToMidpoint((stage.initialP1X + stage.initialP2X) * 0.5);
    this.trauma = 0;
    this.shakeX = 0;
    this.shakeY = 0;
    this.zoomImpulse = 0;
    this.zoom = 1;
  }

  static computeTargetX(midpointX: number, viewportWidth: number, minX: number, maxX: number): number {
    const raw = midpointX - viewportWidth * 0.5;
    return Math.max(minX, Math.min(maxX, raw));
  }

  snapToMidpoint(midpointX: number): void {
    this.x = Camera.computeTargetX(midpointX, this.viewportWidth, this.minX, this.maxX);
  }

  addTrauma(amount: number): void {
    if (this.reducedMotion) return;
    this.trauma = Math.min(1, this.trauma + amount);
  }

  addZoomImpulse(amount: number): void {
    if (this.reducedMotion) return;
    // Keep camera framing clean & wide; subtle impact accent only on Ultimate/KO
    this.zoomImpulse = Math.min(0.018, this.zoomImpulse + amount);
  }

  update(dt: number, fighter1X: number, fighter2X: number): void {
    const midpoint = (fighter1X + fighter2X) * 0.5;
    const targetX = Camera.computeTargetX(midpoint, this.viewportWidth, this.minX, this.maxX);
    const blend = 1 - Math.exp(-this.smoothing * dt);
    this.x += (targetX - this.x) * blend;
    this.x = Math.max(this.minX, Math.min(this.maxX, this.x));

    if (!this.reducedMotion && this.trauma > 0) {
      this.trauma = Math.max(0, this.trauma - dt * 2.9);
      const power = this.trauma * this.trauma;
      const maxOffset = 20 * power;
      this.shakeX = Math.round((Math.random() * 2 - 1) * maxOffset);
      this.shakeY = Math.round((Math.random() * 2 - 1) * maxOffset * 0.6);
    } else {
      this.shakeX = 0;
      this.shakeY = 0;
    }

    if (!this.reducedMotion && this.zoomImpulse > 0.0005) {
      this.zoomImpulse = Math.max(0, this.zoomImpulse - dt * 0.16);
      this.zoom = 1 + this.zoomImpulse;
    } else {
      this.zoom = 1;
    }
  }

  setPositionDirect(x: number): void {
    this.x = Math.max(this.minX, Math.min(this.maxX, x));
  }

  getMaxX(): number {
    return this.maxX;
  }
}
