import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AskedComponent } from '../../components/asked/asked.component';
import { ComposeComponent } from '../../components/compose/compose.component';
import { HeroComponent } from '../../components/hero/hero.component';
import { PaperComponent } from '../../components/paper/paper.component';
import { PriceBandComponent } from '../../components/price-band/price-band.component';
import { TeamTrioComponent } from '../../components/team-trio/team-trio.component';
import { TradesComponent } from '../../components/trades/trades.component';
import { KeyboardService } from '../../services/keyboard.service';

/**
 * The landing page: the chat hero, then the idea goes on paper, the four trades, the
 * three of us, the price dial, two common questions and the composer. Everything below
 * the hero renders as it nears the viewport, at the first Tab, or a few seconds in.
 */
@Component({
  selector: 'jvm-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HeroComponent,
    PaperComponent,
    TradesComponent,
    TeamTrioComponent,
    PriceBandComponent,
    AskedComponent,
    ComposeComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly tabbed = inject(KeyboardService).tabbed;
}
