import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { lockScreenDate } from '../../services/dates';
import { ideaInitial } from '../../services/idea.service';
import { LangService } from '../../services/lang.service';
import { injectProductName } from '../../services/product-name';

/**
 * Mobile apps: a phone lock screen showing today's date, where the idea's first push
 * notification drops in once the card around it has been revealed (the card carries
 * `.is-in`). Decorative; the card around it is aria-hidden.
 */
@Component({
  selector: 'jvm-demo-lock',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslatePipe, SwapTextComponent],
  templateUrl: './demo-lock.component.html',
  styleUrl: './demo-lock.component.scss',
})
export class DemoLockComponent {
  private readonly lang = inject(LangService);
  private readonly today = new Date();

  protected readonly product = injectProductName();
  protected readonly initial = computed(() => ideaInitial(this.product()));
  protected readonly date = computed(() => lockScreenDate(this.today, this.lang.current()));
}
