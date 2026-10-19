import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { DarkSurfaceDirective } from '../../directives/dark-surface.directive';
import { RevealDirective } from '../../directives/reveal.directive';
import { IconComponent } from '../icon/icon.component';
import { PriceDialComponent } from '../price-dial/price-dial.component';
import { SplitTextComponent } from '../split-text/split-text.component';

/** The home page's dark price band: how we price, beside the dial to compare the plans. */
@Component({
  selector: 'jvm-price-band',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    TranslatePipe,
    DarkSurfaceDirective,
    RevealDirective,
    IconComponent,
    PriceDialComponent,
    SplitTextComponent,
  ],
  templateUrl: './price-band.component.html',
  styleUrl: './price-band.component.scss',
})
export class PriceBandComponent {}
