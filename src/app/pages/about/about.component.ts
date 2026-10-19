import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../../components/icon/icon.component';
import { SplitTextComponent } from '../../components/split-text/split-text.component';
import { RevealDirective } from '../../directives/reveal.directive';
import { Person, TEAM, TEAM_ORDER } from '../../services/team';

/** IČO: the company's number in the Czech business register */
const COMPANY_ID = '29633443';

/** Seconds between neighbouring reveals */
const PORTRAIT_STAGGER = 0.08;
const WAY_STAGGER = 0.06;

interface Portrait extends Person {
  roleKey: string;
  bioKey: string;
  /** Id of the name heading, which also names the focusable card */
  nameId: string;
  delay: number;
}

interface Way {
  titleKey: string;
  bodyKey: string;
  delay: number;
}

/** One register entry. Names, addresses and IDs are shown as registered (`value`); the rest is translated. */
interface RegisterRow {
  labelKey: string;
  value?: string;
  valueKey?: string;
}

const PORTRAITS: readonly Portrait[] = TEAM_ORDER.map((id, i) => ({
  ...TEAM[id],
  roleKey: `team.roleLong.${id}`,
  bioKey: `team.bio.${id}`,
  nameId: `portrait-${id}`,
  delay: i * PORTRAIT_STAGGER,
}));

const WAYS: readonly Way[] = (['remote', 'tools', 'langs', 'nda'] as const).map((key, i) => ({
  titleKey: `about.ways.${key}.title`,
  bodyKey: `about.ways.${key}.body`,
  delay: i * WAY_STAGGER,
}));

const REGISTER_ROWS: readonly RegisterRow[] = [
  { labelKey: 'about.company.legalName', value: 'JVM Yore, s.r.o.' },
  { labelKey: 'about.company.ico', value: COMPANY_ID },
  { labelKey: 'about.company.seat', value: 'Příčná 1892/4, Nové Město, 110 00 Praha 1' },
  { labelKey: 'about.company.registration', valueKey: 'about.company.registrationValue' },
  { labelKey: 'about.company.founded', valueKey: 'about.company.foundedValue' },
  { labelKey: 'about.company.directors', value: 'Janis Joanu, Vít Chvoj, Mykhailo Chaban' },
  { labelKey: 'about.company.scope', valueKey: 'about.company.scopeValue' },
];

/**
 * The three of us: a portrait each with the bio on a frosted card, how we work, and the
 * company as the public register lists it, with a link to check it there.
 */
@Component({
  selector: 'jvm-about',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, SplitTextComponent, RevealDirective, IconComponent],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
})
export class AboutComponent {
  protected readonly portraits = PORTRAITS;
  protected readonly ways = WAYS;
  protected readonly registerRows = REGISTER_ROWS;
  protected readonly registerUrl = `https://or.justice.cz/ias/ui/rejstrik-$firma?ico=${COMPANY_ID}`;
}
