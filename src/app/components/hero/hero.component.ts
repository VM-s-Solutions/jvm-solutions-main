import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ChatComponent } from '../chat/chat.component';
import { IconComponent } from '../icon/icon.component';
import { SplitTextComponent } from '../split-text/split-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { IdeaService } from '../../services/idea.service';
import { ScrollService } from '../../services/scroll.service';

/**
 * The home page's first screen: the headline, which ends in the idea's name once it has one
 * ("…who'll build Bloom."), the two ways onward, and the live chat with the three of us.
 */
@Component({
  selector: 'jvm-hero',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, ChatComponent, IconComponent, SplitTextComponent, RevealDirective],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent {
  private readonly idea = inject(IdeaService);
  private readonly scroll = inject(ScrollService);

  protected readonly titleKey = computed(() => (this.idea.hasName() ? 'hero.titleNamed' : 'hero.title'));
  protected readonly titleParams = computed(() => ({ name: this.idea.name() }));

  /** Down to the paper section, and keyboard focus to its heading, so the next Tab carries on from there. */
  protected seeHow(): void {
    this.scroll.scrollTo('how', 'paper-title');
  }
}
