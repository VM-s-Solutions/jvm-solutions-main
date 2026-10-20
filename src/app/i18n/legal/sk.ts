// Slovak strings of the legal pages (privacy, terms, refunds): a mirror of public/i18n/legal/sk.json,
// which the app fetches on the first legal page of a visit. When updating that file, keep this in sync.
// eslint-disable-next-line @typescript-eslint/naming-convention
const sk = {
  "privacy": {
    "changes": {
      "p1": "Ak začneme údaje spracúvať inak, tieto zásady aktualizujeme a zmeníme dátum platnosti v hornej časti stránky. Vždy platí verzia zverejnená tu.",
      "title": "Zmeny týchto zásad"
    },
    "controller": {
      "p1": "Prevádzkovateľom osobných údajov je spoločnosť JVM Yore, s.r.o., IČO 29633443, so sídlom Příčná 1892/4, Nové Město, 110 00 Praha 1, zapísaná v obchodnom registri vedenom Mestským súdom v Prahe, oddiel C, vložka 449138.",
      "p2": "So všetkým, čo sa týka ochrany osobných údajov, sa na nás obráťte na hello@jvm-yore.com. Zodpovednú osobu (DPO) sme neurčili – firme nášho typu to GDPR neukladá.",
      "title": "Kto spracúva vaše údaje"
    },
    "cookies": {
      "li1": "lang – zvolený jazyk webu,",
      "li2": "idea – názov, ktorý ste na úvodnej stránke dali svojmu nápadu, aby ho web mohol používať počas prehliadania. K nám sa dostane, len ak odošlete kontaktný formulár, kde sa predvyplní do poľa Predmet; ak názov vymažete, záznam sa odstráni,",
      "li3": "fontsCached – záznam o tom, že písma už máte stiahnuté, aby sa stránka nabudúce vykreslila rýchlejšie.",
      "p1": "Náš web neukladá žiadne cookies. Do lokálneho úložiska prehliadača (localStorage) zapisujeme len tri položky:",
      "p2": "Overenie Cloudflare Turnstile na stránke Kontakt beží vo vlastnom okne Cloudflare a môže si uložiť technické údaje potrebné na to, aby rozlíšilo človeka od robota. Podľa Cloudflare sa tieto údaje nepoužívajú na sledovanie ani na reklamu. Podrobnosti uvádza dokument Cloudflare Turnstile Privacy Addendum.",
      "title": "Cookies a lokálne úložisko"
    },
    "data": {
      "li1": "Údaje z kontaktného formulára: meno, e-mail, názov firmy (voliteľné), názov vášho projektu (voliteľné), službu, o ktorú máte záujem, text správy a jazyk, v ktorom ste web používali.",
      "li2": "Obsah e-mailov, ktoré nám pošlete priamo, a našu ďalšiu vzájomnú komunikáciu.",
      "li3": "Technické údaje pri odoslaní formulára: IP adresu a signály prehliadača, ktoré spracúva ochrana proti spamu Cloudflare Turnstile.",
      "li4": "Technické údaje pri každej návšteve: IP adresu a údaje o požiadavke, ktoré krátkodobo spracúva poskytovateľ hostingu, aby web fungoval a bol zabezpečený. Sami žiadne záznamy o návštevách nevedieme.",
      "p1": "Spracúvame len tieto údaje:",
      "p2": "Nepoužívame žiadnu analytiku, sledovacie pixely, reklamné nástroje ani profilovanie a nežiadame od vás nič, čo na odpoveď nepotrebujeme.",
      "title": "Aké údaje spracúvame"
    },
    "deletion": {
      "action": "Napísať žiadosť o vymazanie",
      "p1": "Chcete, aby sme vaše údaje vymazali? Napíšte nám na hello@jvm-yore.com z adresy, ktorú ste uviedli vo formulári, s predmetom „Žiadosť o vymazanie údajov“. Dôvod uvádzať nemusíte.",
      "p2": "Do jedného mesiaca vymažeme váš dopyt aj nadväzujúcu komunikáciu z našej schránky, o vymazanie požiadame aj našich sprostredkovateľov a vymazanie vám potvrdíme e-mailom. Ponecháme si len to, čo nám ukladá zákon – zvyčajne vystavené faktúry.",
      "subject": "Žiadosť o vymazanie údajov",
      "title": "Žiadosť o vymazanie údajov"
    },
    "fonts": {
      "p1": "Písma Geologica, Inter, JetBrains Mono a Caveat načítavame z vlastného servera, nie zo služby Google Fonts ani z inej siete CDN. Pri návšteve webu sa tak vaša IP adresa nedostane ku Googlu ani k žiadnemu inému poskytovateľovi písiem. Jediným externým obsahom na webe je overenie Cloudflare Turnstile na stránke Kontakt.",
      "title": "Písma a ďalšie externé zdroje"
    },
    "intro": "Chceme od vás len to, čo potrebujeme, aby sme mohli odpovedať na váš dopyt. Na tejto stránke nájdete, o aké údaje ide, na čo ich používame, komu ich poskytujeme a ako môžete uplatniť svoje práva.",
    "lastUpdated": "Platné od 19. októbra 2026",
    "purposes": {
      "li1": "Odpoveď na dopyt, príprava ponuky a rokovanie o zmluve – vykonanie opatrení pred uzavretím zmluvy na vašu žiadosť (písm. b). Z rovnakého dôvodu vám po odoslaní formulára pošleme potvrdenie s kópiou správy.",
      "li2": "Plnenie uzavretej zmluvy a komunikácia počas spolupráce – plnenie zmluvy (písm. b).",
      "li3": "Ochrana formulára pred spamom a zneužitím a zabezpečenie webu – náš oprávnený záujem (písm. f).",
      "li4": "Vedenie účtovníctva a plnenie daňových povinností, ak spolu uzavrieme zmluvu – splnenie zákonnej povinnosti (písm. c).",
      "p1": "Každý účel má svoj právny základ podľa čl. 6 ods. 1 GDPR:",
      "p2": "Váš súhlas so spracúvaním preto nepotrebujeme. Obchodné oznámenia ani newslettery vám bez vášho výslovného súhlasu posielať nebudeme a nerobíme o vás žiadne automatizované rozhodnutia.",
      "title": "Prečo údaje spracúvame a na akom základe"
    },
    "recipients": {
      "li1": "Microsoft Ireland Operations Ltd. (Microsoft Azure) – hosting webu a servera, ktorý odosiela formulár.",
      "li2": "Resend, Inc. (USA) – doručovanie správ z formulára do našej schránky a potvrdení do tej vašej.",
      "li3": "Cloudflare, Inc. (USA) – ochrana formulára pred robotmi (Turnstile).",
      "li4": "Seznam.cz, a.s. (Česko) – e-mailová schránka hello@jvm-yore.com, v ktorej vaše správy uchovávame.",
      "p1": "Vaše údaje nikomu nepredávame. Pracujú s nimi len títo sprostredkovatelia, ktorí nám pomáhajú prevádzkovať web, a to iba v rozsahu, ktorý si ich služba vyžaduje:",
      "p2": "Inak údaje poskytneme len vtedy, keď nám to ukladá zákon (napríklad úradom na ich žiadosť).",
      "title": "Komu údaje poskytujeme"
    },
    "retention": {
      "li1": "Dopyty a komunikáciu, z ktorej spolupráca nevznikne – najdlhšie 12 mesiacov od poslednej správy, potom ich vymažeme.",
      "li2": "Ak spolu začneme pracovať – počas trvania zmluvy a potom až do uplynutia premlčacej lehoty pre prípadné nároky zo zmluvy (spravidla 3 roky).",
      "li3": "Faktúry a ďalšie účtovné doklady – tak dlho, ako nám to ukladajú účtovné a daňové predpisy (spravidla 5 až 10 rokov).",
      "li4": "Technické údaje z ochrany proti spamu a z hostingu – len krátkodobo, podľa pravidiel spoločností Cloudflare a Microsoft.",
      "p1": "Údaje uchovávame len tak dlho, ako je to nevyhnutné:",
      "title": "Ako dlho údaje uchovávame"
    },
    "rights": {
      "li1": "zistiť, aké údaje o vás spracúvame, a získať ich kópiu (čl. 15 GDPR),",
      "li2": "požadovať opravu nepresných údajov (čl. 16),",
      "li3": "požiadať o vymazanie údajov (čl. 17) – viac v nasledujúcej časti,",
      "li4": "požiadať o obmedzenie spracúvania (čl. 18),",
      "li5": "získať údaje, ktoré ste nám poskytli, v strojovo čitateľnom formáte (čl. 20),",
      "li6": "namietať proti spracúvaniu založenému na našom oprávnenom záujme (čl. 21),",
      "li7": "podať sťažnosť Úradu pre ochranu osobných údajov ČR (Úřad pro ochranu osobních údajů), Pplk. Sochora 27, 170 00 Praha 7, www.uoou.gov.cz, alebo dozornému orgánu v štáte EÚ, v ktorom žijete.",
      "p1": "V súvislosti so svojimi údajmi máte právo:",
      "p2": "Žiadosti vybavujeme bezplatne a bez zbytočného odkladu, najneskôr do jedného mesiaca. Ak si nebudeme istí, že žiadosť posielate vy, môžeme vás požiadať o overenie – najčastejšie tak, že nám napíšete z e-mailu, ktorý ste uviedli vo formulári.",
      "title": "Vaše práva"
    },
    "sectionLabel": "Právne informácie",
    "title": "Zásady ochrany osobných údajov",
    "transfers": {
      "p1": "Spoločnosti Resend a Cloudflare sídlia v USA. Prenos údajov do USA je chránený rámcom ochrany osobných údajov medzi EÚ a USA (EU–U.S. Data Privacy Framework), ku ktorému sa obe spoločnosti pripojili, a štandardnými zmluvnými doložkami schválenými Európskou komisiou.",
      "title": "Prenos údajov mimo EÚ"
    }
  },
  "refunds": {
    "consulting": {
      "p1": "Prvá konzultácia je zadarmo. Ďalšie fakturujeme až po ich skončení, podľa skutočne stráveného času. Termín môžete bezplatne zrušiť alebo presunúť kedykoľvek vopred – stačí nám napísať.",
      "title": "Konzultácie"
    },
    "consumers": {
      "p1": "Ak ste spotrebiteľ a zmluvu sme uzavreli na diaľku (napríklad e-mailom), môžete od nej bez uvedenia dôvodu odstúpiť do 14 dní od jej uzavretia.",
      "p2": "Ak ste výslovne požiadali, aby sme s prácou začali už počas tejto lehoty, pri odstúpení zaplatíte len pomernú časť ceny za prácu vykonanú do momentu odstúpenia. Pokiaľ sme službu s vaším súhlasom v tejto lehote už úplne dokončili, právo na odstúpenie zaniká.",
      "title": "Práva spotrebiteľov"
    },
    "intro": "Platíte len za prácu, ktorú si objednáte a ktorú skutočne odvedieme. Tu prehľadne nájdete, kedy a ako fakturujeme a v akých prípadoch vraciame peniaze.",
    "lastUpdated": "Platné od 20. októbra 2026",
    "monthly": {
      "p1": "Tieto služby fakturujeme mesačne vopred. Vypovedať ich môžete kedykoľvek e-mailom s účinnosťou ku koncu zaplateného mesiaca – ďalšie faktúry už nevystavíme a neplatíte žiadny poplatok za ukončenie.",
      "p2": "Za rozbehnutý mesiac peniaze nevraciame, pretože tím má na váš projekt vyhradený čas. Ak sme však v danom mesiaci z dôvodov na našej strane nedodali dohodnutú kapacitu, rozdiel vám vrátime alebo odpočítame z ďalšej faktúry – podľa toho, čo vám viac vyhovuje.",
      "title": "Celý tím a Podpora a LTS"
    },
    "payments": {
      "p1": "Na webe nič neplatíte a nezbierame na ňom žiadne platobné údaje. Platí sa vždy až po uzavretí zmluvy, na základe faktúry, bankovým prevodom.",
      "p2": "Kedy fakturujeme jednotlivé služby, popisujú obchodné podmienky v časti Ceny a platby.",
      "title": "Ako platíte"
    },
    "projects": {
      "li1": "Zrušíte ho ešte pred začatím práce – vrátime celú zálohu.",
      "li2": "Zrušíte ho počas práce – vyúčtujeme len skutočne odvedenú prácu (podľa dokončených míľnikov, prípadne podľa odpracovaných hodín v dohodnutej hodinovej sadzbe), zvyšok zálohy vrátime a rozpracované výstupy vám odovzdáme.",
      "li3": "Z dôvodov na našej strane dielo nedodáme v dohodnutom rozsahu a termíne ani v primeranej dodatočnej lehote – vrátime vám všetko, čo ste zaplatili za nedodanú časť.",
      "p1": "Pred začatím práce fakturujeme zálohu vo výške 50 % ceny, zvyšok po odovzdaní. Ak sa projekt nedokončí, postupujeme takto:",
      "title": "Projekty s pevným rozsahom"
    },
    "request": {
      "action": "Napísať žiadosť o vrátenie peňazí",
      "li1": "číslo faktúry alebo zmluvy,",
      "li2": "dôvod a sumu, ktorú požadujete,",
      "li3": "číslo účtu, na ktorý vám máme peniaze poslať.",
      "p1": "Napíšte nám na hello@jvm-yore.com a uveďte:",
      "p2": "Odpovieme do 5 pracovných dní. Schválenú sumu vrátime bankovým prevodom najneskôr do 14 dní, bez akýchkoľvek poplatkov z našej strany.",
      "subject": "Žiadosť o vrátenie peňazí",
      "title": "Ako požiadať o vrátenie peňazí"
    },
    "sectionLabel": "Právne informácie",
    "title": "Platby a vrátenie peňazí",
    "warranty": {
      "p1": "Chyby v dodanom diele opravujeme v rámci 30-dňovej záruky bezplatne (pozri obchodné podmienky). Vadu nám nahláste e-mailom aj s popisom, ako ju vyvolať; na kritické chyby reagujeme do 4 hodín. Vaše zákonné práva zo zodpovednosti za vady tým nie sú nijako dotknuté.",
      "title": "Reklamácia vád"
    }
  },
  "terms": {
    "changes": {
      "p1": "Tieto podmienky môžeme aktualizovať. Na už uzavreté zmluvy sa použije verzia platná v deň ich uzavretia, ak sa nedohodneme inak.",
      "title": "Zmeny podmienok"
    },
    "confidentiality": {
      "p1": "Všetko, čo s nami zdieľate, či už ide o podklady, dáta alebo obchodné informácie, považujeme za dôverné a používame len pri práci na vašej zákazke. Na požiadanie podpíšeme NDA ešte pred prvým hovorom. Projekt uvedieme ako referenciu len s vaším súhlasom.",
      "title": "Dôvernosť"
    },
    "contract": {
      "p1": "Ceny a popisy služieb na webe sú orientačné a nie sú záväzným návrhom na uzavretie zmluvy. Zmluva vzniká, až keď písomne (stačí e-mailom) potvrdíte našu konkrétnu ponuku alebo keď obe strany podpíšu samostatnú zmluvu.",
      "p2": "Odoslaním kontaktného formulára sa k ničomu nezaväzujete a nič neplatíte.",
      "title": "Ako uzatvárame zmluvu"
    },
    "cooperation": {
      "p1": "Na začiatku spolu spíšeme zadanie a rozsah. Počas vývoja vidíte priebežné výsledky na testovacom prostredí. Zmeny rozsahu vždy najprv odhadneme a pustíme sa do nich až s vaším súhlasom.",
      "p2": "Aby sme mohli dodať včas, potrebujeme od vás súčinnosť – podklady, prístupy a spätnú väzbu v dohodnutých termínoch. Ak sa v dôsledku oneskorenia na vašej strane posunie harmonogram, o rovnaký čas sa posúva aj termín dodania.",
      "title": "Priebeh spolupráce"
    },
    "disputes": {
      "p1": "Zmluvy sa riadia českým právom. Prípadné spory sa vždy najprv pokúsime vyriešiť dohodou; ak to nepôjde, rozhodne ich príslušný český súd.",
      "p2": "Ako spotrebiteľ môžete spor riešiť aj mimosúdne prostredníctvom Českej obchodnej inšpekcie (Česká obchodní inšpekce, www.coi.cz).",
      "title": "Rozhodné právo a spory"
    },
    "intro": "Tieto podmienky upravujú používanie webu jvm-yore.com a základné pravidlá spolupráce so spoločnosťou JVM Yore, s.r.o. Konkrétny rozsah, cenu a termíny vždy dohodneme v ponuke alebo v zmluve – tá má pred týmito podmienkami prednosť.",
    "ip": {
      "p1": "K zdrojovému kódu máte prístup od prvého dňa – vzniká vo vašom repozitári, alebo vám ho priebežne sprístupňujeme. Zaplatením ceny získavate výhradnú, časovo aj územne neobmedzenú licenciu na dielo vytvorené pre vás vrátane práva upravovať ho a odovzdať ho inému dodávateľovi.",
      "p2": "Knižnice s otvoreným zdrojovým kódom a nástroje tretích strán zostávajú pod svojimi licenciami. Všeobecné know-how a vlastné nástroje, ktoré používame pri viacerých projektoch, môžeme využívať aj naďalej; na ich použitie vo vašom diele máte bezplatnú a neobmedzenú licenciu.",
      "title": "Zdrojový kód a autorské práva"
    },
    "lastUpdated": "Platné od 20. októbra 2026",
    "liability": {
      "p1": "Zodpovedáme za škodu, ktorú spôsobíme porušením svojich povinností. Voči podnikateľom je celková náhrada škody obmedzená výškou ceny zaplatenej za dotknutú službu za posledných 12 mesiacov. Obmedzenie neplatí pre škodu spôsobenú úmyselne alebo z hrubej nedbanlivosti, pre ujmu na zdraví a voči spotrebiteľom.",
      "p2": "Za obsah webov tretích strán, na ktoré odkazujeme, nezodpovedáme.",
      "title": "Zodpovednosť"
    },
    "licenses": {
      "fontsLink": "Licencia písiem (OFL 1.1)",
      "li1": "Písma Geologica (© The Geologica Project Authors), Inter (© The Inter Project Authors), JetBrains Mono (© The JetBrains Mono Project Authors) a Caveat (© The Caveat Project Authors) pod licenciou SIL Open Font License 1.1, uložené na našom vlastnom serveri.",
      "li2": "Open-source knižnice ako Angular, RxJS či ngx-translate pod licenciou MIT a ďalšími slobodnými licenciami.",
      "li3": "Fotografie členov tímu sú naše vlastné. Fotky z fotobánk ani cudzie logá nepoužívame.",
      "p1": "Na webe používame tieto zdroje tretích strán, vždy v súlade s ich licenciami:",
      "softwareLink": "Licencie knižníc",
      "title": "Licencie použitých zdrojov"
    },
    "pricing": {
      "li1": "Nie sme platiteľmi DPH, preto k našim cenám DPH nepripočítavame. Ak sa platiteľmi staneme, dáme vám to vedieť vopred a DPH budeme pripočítavať odo dňa registrácie.",
      "li2": "Projekty s pevným rozsahom: 50 % ceny fakturujeme ako zálohu pred začatím práce, zvyšok po odovzdaní.",
      "li3": "Celý tím a Podpora a LTS: fakturujeme mesačne vopred.",
      "li4": "Konzultácie: prvá je zadarmo, ďalšie fakturujeme po skončení podľa skutočne stráveného času, v hodinovej sadzbe dohodnutej vopred.",
      "li5": "Faktúry sú splatné do 14 dní od vystavenia, bankovým prevodom.",
      "li6": "Náklady tretích strán (napríklad hosting, licencie alebo poplatky obchodov s aplikáciami) platíte priamo vy, alebo vám ich prefakturujeme bez prirážky – vždy až s vaším súhlasom.",
      "p1": "Ceny uvádzame bez skrytých poplatkov. Čokoľvek, čo v cene nie je, s vami vždy dohodneme vopred.",
      "title": "Ceny a platby"
    },
    "provider": {
      "p1": "Služby poskytuje spoločnosť JVM Yore, s.r.o., IČO 29633443, so sídlom Příčná 1892/4, Nové Město, 110 00 Praha 1, zapísaná v obchodnom registri vedenom Mestským súdom v Prahe, oddiel C, vložka 449138 (ďalej len „my“). Kontakt: hello@jvm-yore.com.",
      "title": "Kto sme"
    },
    "scope": {
      "p1": "Služby – vývoj softvéru, podporu a konzultácie – poskytujeme predovšetkým podnikateľom a firmám. Vzťahy s nimi sa riadia týmito podmienkami a českým Občianskym zákonníkom.",
      "p2": "Ak s nami uzavriete zmluvu ako spotrebiteľ, máte navyše všetky práva, ktoré vám priznávajú predpisy na ochranu spotrebiteľa, a tieto podmienky ich nijako neobmedzujú. Týka sa to najmä práva odstúpiť od zmluvy uzavretej na diaľku – podrobnosti nájdete v dokumente Platby a vrátenie peňazí.",
      "title": "Na koho sa podmienky vzťahujú"
    },
    "sectionLabel": "Právne informácie",
    "termination": {
      "p1": "Celý tím aj Podporu a LTS môžete kedykoľvek vypovedať e-mailom, s účinnosťou ku koncu aktuálneho fakturačného mesiaca. Nemáme žiadnu minimálnu dobu trvania ani poplatok za ukončenie.",
      "p2": "Projekt s pevným rozsahom možno ukončiť dohodou alebo z dôvodov, ktoré stanovuje zákon. Ako v takom prípade vyúčtujeme odvedenú prácu a vrátime zálohu, popisuje dokument Platby a vrátenie peňazí.",
      "title": "Ukončenie spolupráce"
    },
    "title": "Obchodné podmienky",
    "warranty": {
      "p1": "Po spustení projektu s pevným rozsahom 30 dní bezplatne opravujeme všetky chyby, ktoré sú v rozpore so zadaním. Na kritickú chybu, ktorá bráni používaniu aplikácie, reagujeme do 4 hodín.",
      "p2": "Pri Podpore a LTS platia reakčné časy (SLA) dohodnuté v zmluve. Záruka sa nevzťahuje na chyby spôsobené zásahmi tretích strán, zmenami infraštruktúry mimo našej správy alebo používaním v rozpore s dokumentáciou.",
      "title": "Záruka a oprava chýb"
    },
    "website": {
      "p1": "Obsah webu – texty, grafika, logo a fotografie tímu – je chránený autorským právom a patrí nám. Bez nášho súhlasu ho, prosím, nekopírujte ani ďalej nešírte; bežné citovanie s uvedením zdroja je v poriadku.",
      "p2": "Snažíme sa, aby informácie na webe boli presné a aktuálne, ale web môže byť občas nedostupný alebo obsahovať chybu. Rozhodujúce sú vždy údaje v ponuke a v zmluve.",
      "title": "Používanie webu"
    }
  }
} as const;

export default sk;
