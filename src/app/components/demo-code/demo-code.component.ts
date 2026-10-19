import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SwapTextComponent } from '../swap-text/swap-text.component';
import { injectProductName } from '../../services/product-name';

/**
 * Backends: a minimal ASP.NET Program.cs whose health endpoint answers in the idea's
 * name. The response line slides in once the card around it has been revealed (the
 * card carries `.is-in`). Decorative; the card around it is aria-hidden.
 */
@Component({
  selector: 'jvm-demo-code',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SwapTextComponent],
  templateUrl: './demo-code.component.html',
  styleUrl: './demo-code.component.scss',
})
export class DemoCodeComponent {
  protected readonly product = injectProductName();
}
