import { siteAuthor, siteOrganisation } from '../navigation/site-nav';

/**
 * The trust anchor pages (`/om`, `/kontakt`, `/privatliv`) as structured data.
 *
 * Both the rendered page and the Markdown representation an agent gets from
 * Accept negotiation are built from this one source, so the two can never drift
 * apart — an agent verifying the business sees exactly what a visitor sees.
 */

export interface SitePageSection {
	heading: string;
	paragraphs: string[];
	bullets?: string[];
}

export interface SitePageDefinition {
	slug: 'om' | 'kontakt' | 'privatliv';
	path: string;
	kicker: string;
	title: string;
	/** Meta description and Open Graph description. */
	description: string;
	intro: string;
	sections: SitePageSection[];
	pageType: 'AboutPage' | 'ContactPage' | 'WebPage';
}

export const contactEmail = siteOrganisation.email;
export const businessEmail = siteOrganisation.businessEmail;

export const aboutPage: SitePageDefinition = {
	slug: 'om',
	path: '/om',
	kicker: 'Mission',
	title: 'Om LearnAI.nu',
	description:
		'LearnAI.nu er en dansk læringsplatform, der gør kunstig intelligens forståelig og anvendelig — med guides, kurser, prompts og værktøjsanmeldelser på dansk.',
	intro:
		'LearnAI.nu er en dansk læringsplatform om kunstig intelligens. Vi oversætter et hurtigt teknologifelt til noget, du kan bruge på mandag: konkrete guides, korte kurser, afprøvede prompts og et værktøjskatalog, der er skrevet til dansk arbejdsliv frem for til amerikanske techmedier.',
	sections: [
		{
			heading: 'Hvad vi laver',
			paragraphs: [
				'Vi udgiver praktisk AI-læring på dansk. Indholdet spænder fra korte nyhedsopsamlinger til lange guides, gratis onlinekurser med øvelser og progression, en promptsamling du kan kopiere direkte ind i dit eget arbejde, og et katalog over AI-værktøjer med vurdering af, hvad de faktisk egner sig til.',
				'Alt materiale bliver skrevet og redigeret af mennesker. AI bruges som arbejdsredskab i produktionen — til research, udkast og oversættelse — men et menneske står altid bag den udgivne tekst og kan stilles til ansvar for den.',
			],
		},
		{
			heading: 'Hvem står bag',
			paragraphs: [
				`${siteAuthor.name} står bag LearnAI.nu og har arbejdet med digitalisering i mere end 16 år. Til daglig arbejder han med ${siteAuthor.role} og med at få ny teknologi til at fungere i praksis i en organisation — ikke som pilotprojekt, men som daglig rutine.`,
				'Det præger indholdet: vi går efter det, der virker i en almindelig hverdag med travle kolleger, eksisterende systemer og reelle krav til datasikkerhed, frem for demoer der kun fungerer på en scene.',
			],
			bullets: [...siteAuthor.knowsAbout],
		},
		{
			heading: 'Sådan arbejder vi',
			paragraphs: [
				'Vi anbefaler kun værktøjer, vi selv har brugt, og vi skriver, når noget ikke duer. Vi modtager ikke betaling for anmeldelser eller placeringer i værktøjskataloget, og vi markerer det tydeligt, hvis et samarbejde har betalt for indhold.',
				'Fejl retter vi åbent. Finder du en fejl eller noget forældet, kan du skrive til os — se kontaktsiden — så bliver siden rettet eller opdateret med en dato.',
			],
		},
		{
			heading: 'Hvem indholdet er til',
			paragraphs: [
				'Målgruppen er fagfolk, ledere, undervisere og selvstændige i Danmark, der skal bruge AI i konkret arbejde: skrive bedre og hurtigere, forstå hvilke opgaver der kan automatiseres, vurdere et værktøj før indkøb, eller klæde et helt team på.',
				'Vi tilbyder også forløb til virksomheder, hvor materialet tilpasses en konkret organisation. Det starter altid med en samtale om, hvad I rent faktisk skal kunne bagefter.',
			],
		},
	],
	pageType: 'AboutPage',
};

export const contactPage: SitePageDefinition = {
	slug: 'kontakt',
	path: '/kontakt',
	kicker: 'Skriv til os',
	title: 'Kontakt LearnAI.nu',
	description:
		'Kontakt LearnAI.nu om læring, indhold, rettelser, presse eller AI-forløb til virksomheder. Vi svarer normalt inden for to hverdage.',
	intro:
		'Du er velkommen til at skrive — om en artikel, et kursus, et samarbejde eller en fejl, du er faldet over. Vi læser alle henvendelser og svarer normalt inden for to hverdage på hverdage i dansk tid.',
	sections: [
		{
			heading: 'Generelle henvendelser',
			paragraphs: [
				`Spørgsmål til indhold, kurser, rettelser og presse: skriv til ${contactEmail}. Skriv gerne linket til den side, det handler om, så kan vi svare konkret med det samme.`,
				'Beder du om en rettelse, hjælper det meget, hvis du skriver, hvad der er forkert, og hvor du har det fra. Vi opdaterer siden og skriver datoen på.',
			],
		},
		{
			heading: 'Virksomheder og forløb',
			paragraphs: [
				`Skal I have et AI-forløb, en workshop eller et tilpasset kursus, kan I skrive til ${businessEmail} eller udfylde formularen på siden for virksomheder. Fortæl gerne kort, hvor mange I er, hvilke opgaver I vil forbedre, og hvornår det skal ligge.`,
				'Vi vender tilbage med et forslag til indhold og omfang, før der bliver talt om pris.',
			],
		},
		{
			heading: 'Faglige spørgsmål med det samme',
			paragraphs: [
				'Har du et konkret fagligt spørgsmål om AI i dit arbejde, kan du prøve AI Mentor på siden. Den er bygget på vores eget materiale, svarer på dansk og henviser til de guides og kurser, der passer til spørgsmålet.',
				'Det erstatter ikke et menneske — men det er hurtigere, og det plejer at være nok til at komme videre.',
			],
		},
		{
			heading: 'Ansvarlig udgiver',
			paragraphs: [
				`LearnAI.nu udgives fra Danmark af ${siteAuthor.name}. Vi kommunikerer på dansk og engelsk. Skriver du om personoplysninger eller ønsker indsigt i, hvad vi har registreret om dig, kan du bruge den samme adresse — se privatlivssiden for, hvordan vi behandler henvendelsen.`,
			],
		},
	],
	pageType: 'ContactPage',
};

export const privacyPage: SitePageDefinition = {
	slug: 'privatliv',
	path: '/privatliv',
	kicker: 'Tillid',
	title: 'Privatliv på LearnAI.nu',
	description:
		'Sådan behandler LearnAI.nu dine oplysninger: cookie-fri statistik, hvad vi gemmer om konti og kursusfremdrift, og hvad vi aldrig sender videre.',
	intro:
		'Vi indsamler så lidt som muligt, og vi sælger ingenting videre. Nedenfor står det konkret: hvad der bliver målt, hvad der bliver gemt, hvor længe, og hvordan du får det slettet.',
	sections: [
		{
			heading: 'Besøgsstatistik og ydeevne',
			paragraphs: [
				'LearnAI.nu bruger Vercel Web Analytics og Vercel Speed Insights til at forstå, hvilke sider der bliver brugt, og hvordan de teknisk fungerer. Målingen er cookie-fri og baseret på anonyme, aggregerede datapunkter.',
				'Vi måler blandt andet sidevisninger, henvisningsside, browser- og enhedstype, omtrentlig geografisk region samt centrale handlinger som kursusstart, gennemført øvelse og afsendt kontaktformular.',
			],
		},
		{
			heading: 'Det sender vi ikke til analytics',
			paragraphs: [
				'Navn, e-mailadresse, virksomhedsnavn, bruger-id, formularfelter, svar fra øvelser og indholdet af samtaler med AI Mentor indgår ikke i vores analytics-events.',
			],
		},
		{
			heading: 'Konto og kursusfremdrift',
			paragraphs: [
				'Opretter du en konto, gemmer vi din e-mailadresse og din fremdrift på kurser, så du kan fortsætte, hvor du slap. Data ligger hos vores databaseleverandør inden for EU og er beskyttet med adgangskontrol på rækkeniveau, så du kun kan læse dine egne rækker.',
				'Du kan til enhver tid bede om at få din konto og dine data slettet. Skriv til os fra den adresse, kontoen er oprettet med, så sletter vi inden for 30 dage.',
			],
		},
		{
			heading: 'Henvendelser og nyhedsbrev',
			paragraphs: [
				'Skriver du til os eller udfylder en formular, gemmer vi din henvendelse, så længe den er relevant for dialogen — og højst to år, hvis der ikke sker mere. Vi bruger den ikke til andet end at svare dig.',
				'Dine rettigheder efter databeskyttelsesforordningen gælder som normalt: indsigt, rettelse, sletning og indsigelse. Vi svarer på anmodninger inden for en måned.',
			],
		},
	],
	pageType: 'WebPage',
};

export const sitePages: SitePageDefinition[] = [aboutPage, contactPage, privacyPage];

/** Serializes a trust anchor page to Markdown for Accept-negotiated responses. */
export function renderSitePageMarkdown(page: SitePageDefinition, origin: URL): string {
	const lines = [
		`# ${page.title}`,
		'',
		page.intro,
		'',
	];
	for (const section of page.sections) {
		lines.push(`## ${section.heading}`, '');
		for (const paragraph of section.paragraphs) lines.push(paragraph, '');
		if (section.bullets?.length) {
			for (const bullet of section.bullets) lines.push(`- ${bullet}`);
			lines.push('');
		}
	}
	lines.push(
		'---',
		'',
		`Kanonisk adresse: ${new URL(page.path, origin).toString()}`,
		`Agentvejledning: ${new URL('/llms.txt', origin).toString()}`,
		'',
	);
	return lines.join('\n');
}
