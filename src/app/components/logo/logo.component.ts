import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * JVM Yore brand lockup — the ribbon mark plus the wordmark, drawn as vectors so it
 * stays sharp at any size. "JVM" inherits `currentColor` so the lockup follows the
 * active theme; the mark and "YORE" keep their fixed brand orange.
 */
@Component({
  selector: 'jvm-logo',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg viewBox="0 0 1214 255" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient [attr.id]="gradientId" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stop-color="#FF8E1E" />
          <stop offset="1" stop-color="#ED5602" />
        </linearGradient>
      </defs>
      <g transform="translate(-163.0 -371.0)">
        <path [attr.fill]="markFill" d="M364.2 371.0Q351.2 371.0 340.1 386.0L179.5 604.0Q170.3 616.5 163.0 616.5L228.0 616.5A31.3 31.3 0 0 0 253.1 603.9L421.5 378.0Q426.7 371.0 421.7 371.0ZM419.5 401.5L509.5 554.0L466.5 614.0L376.5 461.5ZM623.1 418.0Q610.1 418.0 599.2 433.0L466.5 614.0L531.0 614.0A17.3 17.3 0 0 0 544.9 607.0L684.9 418.0ZM703.7 418.0L820.0 614.0L739.4 614.0L664.4 471.0Z" />
        <path fill="currentColor" d="M943 466L966.5 466.0L966.5 525.0A35.5 35.5 0 0 1 931.0 560.5L859.0 560.5L859.0 537.0L931.0 537.0A12.0 12.0 0 0 0 943.0 525.0ZM993 466L1023.5 466.0L1082.8 542.8L1142.0 466.0L1172.5 466.0L1099.3 561.0L1066.2 561.0ZM1200 466L1222.5 466.0L1288.2 527.4L1354.0 466.0L1376.5 466.0L1376.5 561.0L1354.0 561.0L1354.0 499.5L1288.0 561.1L1222.5 499.9L1222.5 561.0L1200.0 561.0Z" />
        <path fill="#F26100" d="M860 594L866.2 594.0L881.5 608.6L896.8 594.0L903.0 594.0L884.6 617.4L884.6 626.0L878.4 626.0L878.4 617.4ZM994.0 594.0H1017.5A9 9 0 0 1 1026.5 603.0V617.0A9 9 0 0 1 1017.5 626.0H994.0A9 9 0 0 1 985.0 617.0V603.0A9 9 0 0 1 994.0 594.0ZM994.5 599.0A4.5 4.5 0 0 0 990.0 603.5V616.5A4.5 4.5 0 0 0 994.5 621.0H1017.0A4.5 4.5 0 0 0 1021.5 616.5V603.5A4.5 4.5 0 0 0 1017.0 599.0ZM1109 594H1141A8 8 0 0 1 1149 602V607A8 8 0 0 1 1141 615H1133.4L1147.7 626H1140.7L1126.4 615H1114.5V626H1109ZM1114.5 598.5V610.5H1140.5A3.5 3.5 0 0 0 1144 607V602A3.5 3.5 0 0 0 1140.5 598.5ZM1230.0 594H1266.5V598.5H1234.5V608.5H1264.5V612.5H1234.5V621.5H1266.5V626H1230.0Z" />
      </g>
    </svg>
  `,
  styleUrl: './logo.component.scss',
})
export class LogoComponent {
  private static instances = 0;

  /** Unique per instance — the lockup renders in both the navbar and the footer,
   *  and a duplicated gradient id would be invalid markup. */
  protected readonly gradientId = `jvm-logo-mark-${LogoComponent.instances++}`;
  protected readonly markFill = `url(#${this.gradientId})`;
}
