import { CharacterId } from '../config/animations';
import { MusicIntensity, MusicScene } from '../config/audioCatalog';
import { StageId } from '../config/stages';
import { AudioMixConfig, audioManager } from './audio/AudioManager';

/**
 * Backwards-compatible facade delegating all sound, music, ambience, and haptic calls
 * to the V2 AudioManager / SFXManager / MusicManager architecture.
 */
class SoundEngineFacade {
  unlock(): boolean {
    return audioManager.unlock();
  }

  isUnlocked(): boolean {
    return audioManager.isUnlocked();
  }

  setVolumes(master: number, sfx: number): void {
    audioManager.setMix({ masterVolume: master, sfxVolume: sfx });
  }

  setAudioMix(mix: Partial<AudioMixConfig>): void {
    audioManager.setMix(mix);
  }

  setMuted(muted: boolean): void {
    audioManager.setMuted(muted);
  }

  isMuted(): boolean {
    return audioManager.isMuted();
  }

  setMusicScene(scene: MusicScene, stageId?: StageId): void {
    audioManager.setMusicScene(scene, stageId);
  }

  setMusicIntensity(intensity: MusicIntensity): void {
    audioManager.setMusicIntensity(intensity);
  }

  triggerHaptic(pattern: number | number[]): void {
    audioManager.triggerHaptic(pattern);
  }

  playUiHover(): void {
    audioManager.sfx.playUiHover();
  }

  playUiSelect(): void {
    audioManager.unlock();
    audioManager.sfx.playUiSelect();
  }

  playUiConfirm(): void {
    audioManager.unlock();
    audioManager.sfx.playUiConfirm();
  }

  playTouchButton(accentHz?: number): void {
    audioManager.unlock();
    audioManager.sfx.playTouchButton(accentHz);
  }

  playPause(isPausing: boolean): void {
    audioManager.sfx.playPause(isPausing);
  }

  playFootstep(slot?: number): void {
    audioManager.sfx.playFootstep(slot);
  }

  playDash(slot?: number): void {
    audioManager.sfx.playDash(slot);
  }

  playWhoosh(heavy = false, isKick = false, slot?: number): void {
    audioManager.sfx.playWhoosh(heavy, isKick, slot);
  }

  playJump(slot?: number): void {
    audioManager.sfx.playJump(slot);
  }

  playLand(slot?: number): void {
    audioManager.sfx.playLand(slot);
  }

  playCrouch(slot?: number): void {
    audioManager.sfx.playCrouch(slot);
  }

  playHit(
    heavy = false,
    extra?: { counter?: boolean; critical?: boolean; attackerId?: CharacterId; slot?: number },
  ): void {
    audioManager.sfx.playHit({
      heavy,
      counter: extra?.counter,
      critical: extra?.critical,
      attackerId: extra?.attackerId,
      slot: extra?.slot,
    });
  }

  playBlock(slot?: number): void {
    audioManager.sfx.playBlock(slot);
  }

  playGuardBreak(slot?: number): void {
    audioManager.sfx.playGuardBreak(slot);
  }

  playKnockdown(slot?: number): void {
    audioManager.sfx.playKnockdown(slot);
  }

  playSpecial(characterId: CharacterId = 'rahul', slot?: number): void {
    audioManager.sfx.playSpecialCharge(characterId, slot);
  }

  playSpecialRelease(characterId: CharacterId, move: 'special_1' | 'special_2' = 'special_1', slot?: number): void {
    audioManager.sfx.playSpecialRelease(characterId, move, slot);
  }

  playUltimate(characterId: CharacterId = 'rahul', slot?: number): void {
    audioManager.sfx.playUltimateActivate(characterId, slot);
  }

  playRoundBell(): void {
    audioManager.sfx.playRoundBell();
  }

  playKO(): void {
    audioManager.sfx.playKO();
  }
}

export const soundEngine = new SoundEngineFacade();
