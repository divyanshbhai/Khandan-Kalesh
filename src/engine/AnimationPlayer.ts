import { SpriteSheetDef } from '../config/animations';

export interface AnimationCallbacks {
  onFrame?: (frameIndex: number) => void;
  onComplete?: () => void;
}

export class AnimationPlayer {
  private def: SpriteSheetDef;
  private elapsed = 0;
  private currentFrame = 0;
  private completed = false;
  private speedMultiplier = 1;
  private callbacks: AnimationCallbacks = {};
  private triggeredFrames = new Set<number>();

  constructor(initialDef: SpriteSheetDef) {
    this.def = initialDef;
  }

  play(
    def: SpriteSheetDef,
    options?: {
      restart?: boolean;
      speed?: number;
      callbacks?: AnimationCallbacks;
    },
  ): void {
    const isSame = this.def.url === def.url && this.def.frames === def.frames;
    if (isSame && !options?.restart && !this.completed) {
      if (options?.speed !== undefined) this.speedMultiplier = options.speed;
      if (options?.callbacks) this.callbacks = options.callbacks;
      return;
    }

    this.def = def;
    this.elapsed = 0;
    this.currentFrame = 0;
    this.completed = false;
    this.speedMultiplier = options?.speed ?? 1;
    this.callbacks = options?.callbacks ?? {};
    this.triggeredFrames.clear();
    this.fireFrameCallback(0);
  }

  setSpeed(speed: number): void {
    this.speedMultiplier = Math.max(0.1, speed);
  }

  update(dt: number): void {
    if (this.completed || this.def.frames <= 1) {
      if (this.def.frames <= 1 && !this.def.loop && !this.completed) {
        this.completed = true;
        this.callbacks.onComplete?.();
      }
      return;
    }

    const frameDuration = 1 / Math.max(1, this.def.fps * this.speedMultiplier);
    this.elapsed += dt;

    while (this.elapsed >= frameDuration) {
      this.elapsed -= frameDuration;
      const nextFrame = this.currentFrame + 1;

      if (nextFrame >= this.def.frames) {
        if (this.def.loop) {
          this.currentFrame = 0;
          this.triggeredFrames.clear();
          this.fireFrameCallback(0);
        } else {
          this.currentFrame = this.def.frames - 1;
          this.completed = true;
          this.callbacks.onComplete?.();
          break;
        }
      } else {
        this.currentFrame = nextFrame;
        this.fireFrameCallback(this.currentFrame);
      }
    }
  }

  private fireFrameCallback(frameIndex: number): void {
    if (!this.triggeredFrames.has(frameIndex)) {
      this.triggeredFrames.add(frameIndex);
      this.callbacks.onFrame?.(frameIndex);
    }
  }

  getFrame(): number {
    return this.currentFrame;
  }

  setFrame(frameIndex: number): void {
    this.currentFrame = Math.max(0, Math.min(Math.max(0, this.def.frames - 1), Math.floor(frameIndex)));
  }

  getDefinition(): SpriteSheetDef {
    return this.def;
  }

  isCompleted(): boolean {
    return this.completed;
  }

  getSourceRect(): { sx: number; sy: number; sw: number; sh: number } {
    const layout = this.def.layout ?? 'horizontal';
    if (layout === 'vertical') {
      return {
        sx: 0,
        sy: this.currentFrame * this.def.frameHeight,
        sw: this.def.frameWidth,
        sh: this.def.frameHeight,
      };
    }
    return {
      sx: this.currentFrame * this.def.frameWidth,
      sy: 0,
      sw: this.def.frameWidth,
      sh: this.def.frameHeight,
    };
  }
}
