import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  LucideArrowRight,
  LucideCircleHelp,
  LucideFootprints,
  LucideMap,
  LucideMapPin,
  LucideSparkles,
  LucideStore,
  LucideSwords,
  LucideTentTree,
  LucideTrophy,
} from '@lucide/angular';
import { ScreenBase } from '../screen-base';

@Component({
  selector: 'app-route-map-screen',
  standalone: true,
  imports: [
    LucideArrowRight,
    LucideCircleHelp,
    LucideFootprints,
    LucideMap,
    LucideMapPin,
    LucideSparkles,
    LucideStore,
    LucideSwords,
    LucideTentTree,
    LucideTrophy,
  ],
  templateUrl: './route-map-screen.html',
  styles: [':host { display: contents; }'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RouteMapScreen extends ScreenBase {}
