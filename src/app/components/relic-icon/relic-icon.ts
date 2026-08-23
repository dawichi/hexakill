import { Component, input } from '@angular/core';
import {
  LucideBadgeDollarSign,
  LucideBatteryCharging,
  LucideBellRing,
  LucideBookOpen,
  LucideCompass,
  LucideCoins,
  LucideCrosshair,
  LucideCrown,
  LucideDrum,
  LucideFeather,
  LucideFlame,
  LucideFlaskConical,
  LucideFlaskRound,
  LucideFootprints,
  LucideHeart,
  LucideHeartCrack,
  LucideHeartPlus,
  LucideHeartPulse,
  LucideHourglass,
  LucideInfinity,
  LucideLampDesk,
  LucideMap,
  LucideMoonStar,
  LucideScrollText,
  LucideShield,
  LucideShieldAlert,
  LucideSparkles,
  LucideSword,
  LucideSwords,
} from '@lucide/angular';

@Component({
  selector: 'app-relic-icon',
  imports: [
    LucideBadgeDollarSign,
    LucideBatteryCharging,
    LucideBellRing,
    LucideBookOpen,
    LucideCompass,
    LucideCoins,
    LucideCrosshair,
    LucideCrown,
    LucideDrum,
    LucideFeather,
    LucideFlame,
    LucideFlaskConical,
    LucideFlaskRound,
    LucideFootprints,
    LucideHeart,
    LucideHeartCrack,
    LucideHeartPlus,
    LucideHeartPulse,
    LucideHourglass,
    LucideInfinity,
    LucideLampDesk,
    LucideMap,
    LucideMoonStar,
    LucideScrollText,
    LucideShield,
    LucideShieldAlert,
    LucideSparkles,
    LucideSword,
    LucideSwords,
  ],
  template: `
    @switch (icon()) {
      @case ('Sword') {
        <svg lucideSword [attr.aria-label]="label()"></svg>
      }
      @case ('BookOpen') {
        <svg lucideBookOpen [attr.aria-label]="label()"></svg>
      }
      @case ('Shield') {
        <svg lucideShield [attr.aria-label]="label()"></svg>
      }
      @case ('Footprints') {
        <svg lucideFootprints [attr.aria-label]="label()"></svg>
      }
      @case ('HeartPlus') {
        <svg lucideHeartPlus [attr.aria-label]="label()"></svg>
      }
      @case ('Flame') {
        <svg lucideFlame [attr.aria-label]="label()"></svg>
      }
      @case ('HeartPulse') {
        <svg lucideHeartPulse [attr.aria-label]="label()"></svg>
      }
      @case ('Coins') {
        <svg lucideCoins [attr.aria-label]="label()"></svg>
      }
      @case ('Compass') {
        <svg lucideCompass [attr.aria-label]="label()"></svg>
      }
      @case ('FlaskConical') {
        <svg lucideFlaskConical [attr.aria-label]="label()"></svg>
      }
      @case ('ShieldAlert') {
        <svg lucideShieldAlert [attr.aria-label]="label()"></svg>
      }
      @case ('Sparkles') {
        <svg lucideSparkles [attr.aria-label]="label()"></svg>
      }
      @case ('Swords') {
        <svg lucideSwords [attr.aria-label]="label()"></svg>
      }
      @case ('ScrollText') {
        <svg lucideScrollText [attr.aria-label]="label()"></svg>
      }
      @case ('BellRing') {
        <svg lucideBellRing [attr.aria-label]="label()"></svg>
      }
      @case ('BatteryCharging') {
        <svg lucideBatteryCharging [attr.aria-label]="label()"></svg>
      }
      @case ('Drum') {
        <svg lucideDrum [attr.aria-label]="label()"></svg>
      }
      @case ('FlaskRound') {
        <svg lucideFlaskRound [attr.aria-label]="label()"></svg>
      }
      @case ('Map') {
        <svg lucideMap [attr.aria-label]="label()"></svg>
      }
      @case ('HeartCrack') {
        <svg lucideHeartCrack [attr.aria-label]="label()"></svg>
      }
      @case ('Feather') {
        <svg lucideFeather [attr.aria-label]="label()"></svg>
      }
      @case ('Hourglass') {
        <svg lucideHourglass [attr.aria-label]="label()"></svg>
      }
      @case ('MoonStar') {
        <svg lucideMoonStar [attr.aria-label]="label()"></svg>
      }
      @case ('Crown') {
        <svg lucideCrown [attr.aria-label]="label()"></svg>
      }
      @case ('Infinity') {
        <svg lucideInfinity [attr.aria-label]="label()"></svg>
      }
      @case ('Heart') {
        <svg lucideHeart [attr.aria-label]="label()"></svg>
      }
      @case ('LampDesk') {
        <svg lucideLampDesk [attr.aria-label]="label()"></svg>
      }
      @case ('Crosshair') {
        <svg lucideCrosshair [attr.aria-label]="label()"></svg>
      }
      @case ('BadgeDollarSign') {
        <svg lucideBadgeDollarSign [attr.aria-label]="label()"></svg>
      }
      @default {
        <svg lucideSparkles [attr.aria-label]="label()"></svg>
      }
    }
  `,
})
export class RelicIconComponent {
  readonly icon = input.required<string>();
  readonly label = input('');
}
