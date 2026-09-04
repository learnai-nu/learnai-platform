-- Katalogindhold (værktøjer, use cases og ressourcer) migreret fra det gamle
-- Lovable-site. Tabellerne følger platformens autorisationsmodel: RLS er den
-- primære grænse, offentlige læsere ser kun publicerede rækker, og kun
-- redaktører og administratorer kan skrive.

-- Migrationen er skrevet, så den kan køres igen oven på et miljø, hvor dele
-- allerede er oprettet. Postgres har ingen "create type if not exists", så
-- typerne oprettes i en blok, der tier ved dubletter.
do $$ begin
  create type public.catalog_locale as enum ('da', 'en');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.catalog_use_case_department as enum ('hr', 'it', 'marketing', 'operations');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.catalog_use_case_complexity as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.catalog_use_case_value as enum ('efficiency', 'quality', 'growth');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.catalog_resource_type as enum ('podcast', 'youtube', 'bog', 'kursus', 'nyhedsbrev', 'rapport');
exception when duplicate_object then null; end $$;

create table if not exists public.tools (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  tagline text not null default '',
  description text not null default '',
  icon_url text,
  categories text[] not null default '{}',
  badges text[] not null default '{}',
  key_features text[] not null default '{}',
  pricing_display text,
  external_url text,
  featured boolean not null default false,
  published boolean not null default false,
  locale public.catalog_locale not null default 'da',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create table if not exists public.use_cases (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  reference text,
  department public.catalog_use_case_department not null,
  complexity public.catalog_use_case_complexity not null,
  strategic_value public.catalog_use_case_value not null,
  problem_statement text not null,
  solution text not null,
  business_benefits text[] not null default '{}',
  recommended_tools text[] not null default '{}',
  featured boolean not null default false,
  published boolean not null default false,
  locale public.catalog_locale not null default 'da',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale)
);

create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  title text not null,
  type public.catalog_resource_type not null,
  url text not null,
  description text not null default '',
  rating numeric(2, 1),
  topics text[] not null default '{}',
  published boolean not null default false,
  locale public.catalog_locale not null default 'da',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (slug, locale),
  constraint resources_rating_range check (rating is null or (rating >= 0 and rating <= 5))
);

-- Et tidligere forsøg kunne nå at oprette tabellerne oven på en fremmed enum
-- (fx et resource_type, der tilhører noget helt andet). Flyt i så fald
-- kolonnerne over på katalogets egne typer. Blokken er en no-op, når typerne
-- allerede er de rigtige.
do $$
declare
  target record;
  current_type text;
begin
  for target in
    select *
    from (values
      ('tools', 'locale', 'catalog_locale'),
      ('use_cases', 'locale', 'catalog_locale'),
      ('resources', 'locale', 'catalog_locale'),
      ('use_cases', 'department', 'catalog_use_case_department'),
      ('use_cases', 'complexity', 'catalog_use_case_complexity'),
      ('use_cases', 'strategic_value', 'catalog_use_case_value'),
      ('resources', 'type', 'catalog_resource_type')
    ) as t(table_name, column_name, target_type)
  loop
    select c.udt_name into current_type
    from information_schema.columns c
    where c.table_schema = 'public'
      and c.table_name = target.table_name
      and c.column_name = target.column_name;

    if current_type is not null and current_type <> target.target_type then
      execute format('alter table public.%I alter column %I drop default', target.table_name, target.column_name);
      execute format(
        'alter table public.%I alter column %I type public.%I using %I::text::public.%I',
        target.table_name, target.column_name, target.target_type, target.column_name, target.target_type
      );
      if target.column_name = 'locale' then
        execute format('alter table public.%I alter column %I set default ''da''', target.table_name, target.column_name);
      end if;
    end if;
  end loop;
end $$;

create index if not exists tools_published_idx on public.tools (locale, published, sort_order);
create index if not exists use_cases_published_idx on public.use_cases (locale, published, sort_order);
create index if not exists resources_published_idx on public.resources (locale, published, sort_order);

-- Fælles trigger, så updated_at ikke afhænger af klienten.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog, pg_temp
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists tools_touch_updated_at on public.tools;
create trigger tools_touch_updated_at before update on public.tools
  for each row execute function public.touch_updated_at();
drop trigger if exists use_cases_touch_updated_at on public.use_cases;
create trigger use_cases_touch_updated_at before update on public.use_cases
  for each row execute function public.touch_updated_at();
drop trigger if exists resources_touch_updated_at on public.resources;
create trigger resources_touch_updated_at before update on public.resources
  for each row execute function public.touch_updated_at();

alter table public.tools enable row level security;
alter table public.use_cases enable row level security;
alter table public.resources enable row level security;

-- Læsning: publiceret katalogindhold er offentligt. Alt andet kræver en
-- redaktør- eller administratorrolle i JWT'ens app_metadata.
drop policy if exists tools_public_read on public.tools;
create policy tools_public_read on public.tools
  for select to anon, authenticated using (published);
drop policy if exists use_cases_public_read on public.use_cases;
create policy use_cases_public_read on public.use_cases
  for select to anon, authenticated using (published);
drop policy if exists resources_public_read on public.resources;
create policy resources_public_read on public.resources
  for select to anon, authenticated using (published);

drop policy if exists tools_manager_read on public.tools;
create policy tools_manager_read on public.tools
  for select to authenticated using (private.is_content_manager());
drop policy if exists use_cases_manager_read on public.use_cases;
create policy use_cases_manager_read on public.use_cases
  for select to authenticated using (private.is_content_manager());
drop policy if exists resources_manager_read on public.resources;
create policy resources_manager_read on public.resources
  for select to authenticated using (private.is_content_manager());

drop policy if exists tools_manager_write on public.tools;
create policy tools_manager_write on public.tools
  for all to authenticated
  using (private.is_content_manager())
  with check (private.is_content_manager());
drop policy if exists use_cases_manager_write on public.use_cases;
create policy use_cases_manager_write on public.use_cases
  for all to authenticated
  using (private.is_content_manager())
  with check (private.is_content_manager());
drop policy if exists resources_manager_write on public.resources;
create policy resources_manager_write on public.resources
  for all to authenticated
  using (private.is_content_manager())
  with check (private.is_content_manager());

grant select on public.tools, public.use_cases, public.resources to anon, authenticated;
grant insert, update, delete on public.tools, public.use_cases, public.resources to authenticated;

-- Migreret indhold. Kun publiceret dansk indhold er flyttet med; sitet er
-- dansk-only. Rækkerne er idempotente, så migrationen kan køres på et miljø,
-- hvor katalogerne allerede er delvist importeret.

insert into public.tools (slug, name, tagline, description, icon_url, categories, badges, key_features, pricing_display, external_url, featured, published, locale, sort_order) values
  ('adobe-firefly', 'Adobe Firefly', 'Enterprise-sikker AI integreret i Creative Cloud', 'Firefly er skabt til erhvervsbrug med fokus på ophavsretlig sikkerhed. Den er integreret direkte i Photoshop, hvilket gør det muligt at redigere billeder lynhurtigt med ''Generative Fill''.', 'https://www.adobe.com/favicon.ico', array['images', 'video']::text[], array['tried_tested']::text[], array['Generative Fill: Tilføj eller fjern objekter med tekst', 'Commercial Safety: Trænet på licenseret Adobe-data']::text[], 'Inkluderet i Creative Cloud eller Gratis (begrænset)', 'https://firefly.adobe.com/', false, true, 'da', 0),
  ('bolt-new', 'Bolt.new', 'Instant webudvikling direkte i browseren', 'Bolt.new lader dig bygge, køre og deploye fulde webapplikationer direkte fra din browser via prompts. Det fjerner behovet for lokal opsætning og accelererer udviklingscyklussen markant.', 'https://bolt.new/favicon.ico', array['coding', 'automation']::text[], array['tried_tested']::text[], array['In-browser IDE: Kør koden uden at installere noget', 'StackBlitz Integration: Professionelt udviklingsmiljø']::text[], 'Freemium', 'https://bolt.new/', false, true, 'da', 1),
  ('chatgpt', 'ChatGPT', 'Verdens førende AI-assistent til erhverv og produktivitet.', 'ChatGPT er guldstandarden inden for generativ AI, der leverer massiv ROI gennem automatisering af vidensarbejde. Værktøjet fungerer som en alsidig forretningspartner, der kan analysere komplekse datasæt, generere professionelt indhold og bygge specialiserede AI-agenter (GPTs), hvilket sparer gennemsnitligt 40-60 minutter pr. medarbejder dagligt.', 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg', array['text', 'coding', 'images', 'automation']::text[], array['recommended', 'tried_tested']::text[], array['Avanceret Ræsonnering: Løser komplekse logiske opgaver med GPT-5 teknologi', 'Custom GPTs: Byg egne agenter til specifikke arbejdsgange uden kode']::text[], 'Fra $20/md (Plus) eller $25/bruger (Business)', 'https://chatgpt.com/', true, true, 'da', 2),
  ('claude-anthropic', 'Claude (Anthropic)', 'Avanceret AI med fokus på sikkerhed og nuanceret sprog', 'Claude er kendt for sin menneskelignende skrivestil og store kontekstvindue. For virksomheder leverer den høj ROI gennem præcis dokumentanalyse, kodning og kompleks opgaveløsning med færre hallucinationer end konkurrenterne.', 'https://claude.ai/favicon.ico', array['text', 'coding', 'research']::text[], array['tried_tested']::text[], array['Artifacts: Interaktivt vindue til realtids-eksekvering af kode og design', '200k Kontekstvindue: Håndtering af hele tekniske manualer eller bøger', 'Overlegen sprogforståelse og nuanceret ræsonnering']::text[], 'Gratis eller $20/md (Pro)', 'https://claude.ai/', false, true, 'da', 3),
  ('claude-design', 'Claude Design', 'Fra idé til færdigt UI-design via samtale med Claude', 'Claude Design er Anthropics nye design-værktøj, der lader dig generere komplette brugergrænseflader, prototyper og design-systemer gennem naturlig samtale med Claude. Skift mellem chat og canvas, integrér eget designsystem og eksportér til kode eller Figma. Læs vores fulde guide her: /articles/claude-design-guide', 'https://claude.ai/favicon.ico', array['other', 'coding']::text[], array['recommended', 'new']::text[], array['Chat- og canvas-tilstand til iterativt UI-design', 'Integration med eget designsystem og brand-tokens', 'Eksport til kode (HTML/CSS/React) eller Figma', 'Indbygget i Claude Pro, Max, Team og Enterprise', 'Multi-skærms prototyper og flows i én samtale']::text[], 'Inkluderet i Claude Pro (fra $20/md)', 'https://claude.ai/design', false, true, 'da', 4),
  ('elevenlabs', 'ElevenLabs', 'Verdens mest realistiske AI-stemmer', 'ElevenLabs leverer tæt på perfekte stemmer til lydbøger, videoer og spil. Deres teknologi til stemmekloning er uovertruffen og skaber stor værdi i global indholdsproduktion.', 'https://elevenlabs.io/favicon.ico', array['audio', 'video', 'automation']::text[], array['recommended', 'tried_tested']::text[], array['Voice Cloning: Klon din egen stemme på minutter', 'Speech-to-Speech: Skift stemme men bevar følelsen']::text[], 'Gratis eller $5/md (Starter)', 'https://elevenlabs.io/', true, true, 'da', 5),
  ('freepik-ai', 'Freepik AI', 'Fra lagerbilleder til AI-genereret grafik', 'Freepik har udvidet deres enorme database med AI-værktøjer. Det gør det muligt for marketingteams at generere og tilpasse grafik i én sammenhængende arbejdsgang.', 'https://www.freepik.com/favicon.ico', array['images']::text[], '{}', array['AI Image Generator: Skab billeder direkte i platformen', 'Real-time Sketch: Gør simple streger til færdig kunst']::text[], 'Gratis eller Premium abonnement', 'https://www.freepik.com/', false, true, 'da', 6),
  ('gamma', 'Gamma', 'Generer professionelle præsentationer på sekunder', 'Gamma fjerner ''den hvide side''-syndromet ved at transformere tekst eller prompts til færdige præsentationer og hjemmesider. ROI findes i den massive tidsbesparelse på layout og formatering.', 'https://gamma.app/favicon.ico', array['images', 'text']::text[], '{}', array['One-click Restyling: Skift hele præsentationens look øjeblikkeligt', 'AI-Powered Outlines: Genererer struktur og indhold automatisk']::text[], 'Gratis (Freemium) eller $8/md', 'https://gamma.app/', false, true, 'da', 7),
  ('google-ai-studio', 'Google AI Studio', 'Udviklerens sandkasse til Gemini-modeller', 'AI Studio er det ultimative værktøj til at teste og bygge med Googles nyeste modeller. Det giver adgang til de største kontekstvinduer på markedet, ideelt til analyse af enorme datamængder.', 'https://aistudio.google.com/favicon.ico', array['coding', 'text', 'automation']::text[], array['tried_tested']::text[], array['2M Context Window: Analysér gigantiske datasæt eller timevis af video', 'API Key Management: Nem overgang fra prototype til produktion']::text[], 'Gratis (inden for kvoter)', 'https://aistudio.google.com/', false, true, 'da', 8),
  ('google-gemini', 'Google Gemini', 'Multimodal intelligens integreret i Google Workspace', 'Gemini er Googles mest kapable AI, der excellerer i multimodalitet. Den skaber værdi ved at forbinde direkte til Google Workspace (Docs, Gmail, Drive), hvilket automatiserer workflows på tværs af virksomhedens eksisterende værktøjer.', 'https://www.gstatic.com/lamda/images/favicon_v1_150160d13988652c776.png', array['text', 'automation', 'images']::text[], array['recommended', 'tried_tested']::text[], array['Native Multimodalitet: Forstår tekst, billeder, video og lyd i én prompt', 'Google Workspace Integration: Hent data direkte fra Gmail og Drive', 'Ekstremt hurtig responstid']::text[], 'Gratis eller 160 kr/md (Advanced)', 'https://gemini.google.com/app', true, true, 'da', 9),
  ('google-stitch', 'Google Stitch', 'Fra vision til færdigt UI-design på sekunder', 'Google Stitch er et banebrydende AI-drevet designværktøj, der transformerer naturligt sprog eller simple skitser til high-fidelity UI-designs og produktionsklar frontend-kode. For virksomheder betyder det en markant reduktion i ''time-to-market'' for MVPs og digitale produkter, da broen mellem idé, design og kode automatiseres gennem Googles Gemini-modeller.', 'https://stitch.withgoogle.com/static/favicon.png', array['other', 'coding']::text[], array['recommended', 'tried_tested']::text[], array['Vibe Design: Generer komplekse brugerflader via simple tekstbeskrivelser', 'Code Export: Eksportér direkte til ren HTML, CSS eller Tailwind-kode', 'Figma Integration: Sømløs overførsel af AI-genererede lag til Figma']::text[], 'Gratis (via Google Labs)', 'https://stitch.withgoogle.com/', true, true, 'da', 10),
  ('grok-xai', 'Grok (xAI)', 'Realtids-indsigt med direkte adgang til X-platformen', 'Grok differentierer sig ved at have adgang til realtidsstrømme fra X. For erhvervslivet er det et kraftfuldt værktøj til trend-analyse, brand-monitorering og nyhedsovervågning, før de rammer traditionelle medier.', 'https://abs.twimg.com/favicons/twitter.2.ico', array['text', 'research']::text[], array['tried_tested']::text[], array['Real-time Knowledge: Adgang til live data fra X (tidligere Twitter)', 'Unfiltered Mode: Giver mere direkte og mindre censurerede svar', 'Hurtig responstid og aktuelle begivenheder']::text[], 'Kræver X Premium/Premium+', 'https://x.com/i/grok', false, true, 'da', 11),
  ('heygen', 'HeyGen', 'AI-videoer med realistiske avatarer', 'HeyGen er førende inden for AI-avatarer. Det gør det muligt at producere træningsvideoer og personaliserede salgshilsner i stor skala uden brug af kamera eller skuespillere.', 'https://www.heygen.com/favicon.ico', array['video', 'audio']::text[], array['tried_tested']::text[], array['Video Translation: Oversæt video og synkronisér læber', 'Custom Avatars: Lav en digital kopi af dig selv']::text[], 'Fra $24/md', 'https://www.heygen.com/', false, true, 'da', 12),
  ('ideogram', 'Ideogram', 'Ekspert i præcis tekst i AI-billeder', 'Ideogram løser det klassiske AI-problem med ulæselig tekst i billeder. Perfekt til logo-design, plakater og SoMe-grafik, hvor typografi skal stå knivskarpt.', 'https://ideogram.ai/favicon.ico', array['images']::text[], '{}', array['Typography Engine: Perfekt stavet tekst i billeder', 'Magic Prompt: Hjælper med at udbygge dine korte prompts']::text[], 'Gratis eller $8/md', 'https://ideogram.ai/', false, true, 'da', 13),
  ('lovable', 'Lovable', 'Gør prompts til fuldt funktionelle web-apps', 'Lovable (tidligere GPT Engineer) gør det muligt for ikke-teknikere at bygge komplekse web-apps. Det reducerer udviklingsomkostninger drastisk og forkorter ''time-to-market'' for prototyper.', 'https://lovable.dev/favicon.ico', array['coding', 'automation']::text[], array['recommended', 'tried_tested']::text[], array['Full-stack Development: Håndterer både frontend og backend', 'GitHub Integration: Synkroniserer kode direkte til dit repository']::text[], 'Gratis start eller $20/md', 'https://lovable.dev/', true, true, 'da', 14),
  ('microsoft-copilot', 'Microsoft Copilot', 'Din AI-makker til Microsoft 365 og erhvervslivet', 'Copilot transformerer kontorarbejde ved at bygge bro mellem GPT-4 og Microsoft 365. Forretningsværdien ligger i lynhurtig opsummering af Teams-møder, udkast til PowerPoints og dataanalyse i Excel.', 'https://copilot.microsoft.com/favicon.ico', array['text', 'automation']::text[], array['tried_tested']::text[], array['Microsoft 365 Integration: Fungerer inde i Word, Excel og PowerPoint', 'Enterprise Data Protection: Sikrer at virksomhedsdata ikke træner modellen', 'Teams mødeopsummering og handlingspunkter']::text[], 'Gratis (Web) eller licensbaseret (M365)', 'https://copilot.microsoft.com/', false, true, 'da', 15),
  ('midjourney', 'Midjourney', 'Markedets mest kunstneriske AI-billedgenerator', 'Midjourney leverer den højeste æstetiske kvalitet i AI-genererede billeder. For marketingbureauer og designere betyder det adgang til unikke visuelle aktiver uden dyre fotoshoots.', 'https://www.midjourney.com/favicon.ico', array['images', 'video']::text[], array['tried_tested']::text[], array['V6.1 Model: Fotorealistiske og kunstneriske outputs', 'Web Editor: Redigér billeder direkte i browseren']::text[], 'Fra $10/md', 'https://www.midjourney.com/', false, true, 'da', 16),
  ('notebooklm', 'NotebookLM', 'Din personlige AI-forsker baseret på dine data', 'NotebookLM bruger dine egne dokumenter som kildegrundlag. Det er uundværligt til at forstå komplekse projekter og kan endda generere en AI-podcast (Audio Overview) baseret på dine noter.', 'https://www.gstatic.com/notebooklm/favicon.ico', array['text', 'research', 'audio']::text[], array['recommended', 'tried_tested']::text[], array['Source-Grounded: Svarer kun baseret på dine kilder', 'Audio Overview: Transformer noter til en dialog-podcast']::text[], 'Gratis', 'https://notebooklm.google.com/', true, true, 'da', 17),
  ('perplexity-ai', 'Perplexity AI', 'Fremtidens søgemaskine med kildehenvisninger', 'Perplexity sparer virksomheder for timevis af research ved at levere direkte svar med præcise kildehenvisninger. Det sikrer høj troværdighed i beslutningsgrundlag og markedsanalyse.', 'https://www.perplexity.ai/favicon.ico', array['text', 'research']::text[], array['tried_tested']::text[], array['Real-time Search: Gennemsøger internettet for de nyeste data', 'Citations: Direkte links til alle anvendte kilder for faktatjek']::text[], 'Gratis eller $20/md (Pro)', 'https://www.perplexity.ai/', false, true, 'da', 18),
  ('sora-openai', 'Sora (OpenAI)', 'Tekst-til-video der sprænger rammerne', 'Sora er OpenAIs kommende videoværktøj, der kan generere op til 60 sekunders kompleks video. Selvom det stadig er i ''early access'', lover det at revolutionere film- og reklamebranchen.', 'https://openai.com/favicon.ico', array['video']::text[], array['new']::text[], array['High Fidelity: Komplekse scener med præcis fysik', 'Long Duration: Op til 1 minuts video fra én prompt']::text[], 'Endnu ikke offentliggjort', 'https://openai.com/sora/', false, true, 'da', 19),
  ('suno-ai', 'Suno AI', 'Skab komplette sange med vokal på sekunder', 'Suno demokratiserer musikproduktion. For virksomheder er det ideelt til at skabe jingles, baggrundsmusik eller sjove personaliserede sange til interne events uden licensproblemer.', 'https://suno.com/favicon.ico', array['audio']::text[], array['tried_tested']::text[], array['Full Song Generation: Tekst, melodi og vokal i ét', 'Style Prompting: Vælg præcis genre og stemning']::text[], 'Gratis eller $10/md (Pro)', 'https://suno.com/', false, true, 'da', 20),
  ('synthesia', 'Synthesia', 'Nr. 1 platform til Enterprise AI-video', 'Synthesia er guldstandarden for corporate video. Det sparer virksomheder for millioner i videoproduktion ved at lade dem skabe professionelle træningsvideoer blot ved at skrive tekst.', 'https://www.synthesia.io/favicon.ico', array['video', 'automation']::text[], array['recommended', 'tried_tested']::text[], array['140+ Avatarer: Bred diversitet til global brug', 'AI Video Assistant: Skaber scripts og layouts automatisk']::text[], 'Fra $22/md', 'https://www.synthesia.io/', true, true, 'da', 21),
  ('udio', 'Udio', 'Professionel musikkvalitet via AI', 'Udio er kendt for sin ekstremt høje lydkvalitet og musikalske forståelse. Det er værktøjet for dem, der har brug for seriøs komposition og realistisk lydproduktion.', 'https://www.udio.com/favicon.ico', array['audio']::text[], array['recommended', 'tried_tested']::text[], array['High-Fidelity Audio: Studio-kvalitet lyd', 'Extend Tracks: Udbyg dine sange bid for bid']::text[], 'Freemium', 'https://www.udio.com/', false, true, 'da', 22)
on conflict (slug, locale) do nothing;

insert into public.use_cases (slug, title, reference, department, complexity, strategic_value, problem_statement, solution, business_benefits, recommended_tools, featured, published, locale, sort_order) values
  ('ai-mus-samtaler', 'AI-assisteret MUS-samtale og opfølgning', 'UC-101', 'hr', 'low', 'quality', 'Ledere bruger ofte MUS-samtaler på at tage noter i stedet for at lytte aktivt. Referater bliver uensartede, og opfølgning på udviklingsmål falder mellem to stole.', 'Brug AI til at transskribere samtalen i realtid via Microsoft Teams, og lad derefter en AI-assistent strukturere referatet efter faste fokusområder. Efter alle samtaler kan AI identificere fælles temaer på tværs af teamet og generere en samlet opfølgningskalender.', array['Mere nærvær og aktiv lytning i samtalen', 'Ensartede og strukturerede referater på 5 minutter', 'Tværgående analyse af udviklingsmål og temaer', 'Automatisk opfølgningskalender med deadlines', 'Bedre medarbejderoplevelse og højere trivsel']::text[], array['Microsoft Teams', 'ChatGPT', 'Claude', 'Copilot']::text[], true, true, 'da', 0),
  ('accelereret-softwareudvikling', 'Accelereret softwareudvikling og kodegenerering', '#5', 'it', 'high', 'efficiency', 'Udviklingsteams er ofte flaskehalse pga. manuelle, repetitive kodeopgaver og mangel på ressourcer.', 'Gen AI assisterer professionelle udviklere med at skrive, optimere og teste kode lynhurtigt, hvilket reducerer udviklingstiden for nye features dramatisk.', array['Markant kortere ''Time-to-Market'' for nye softwareprodukter.', 'Frigørelse af seniorudviklere til arkitektur og komplekse problemer.', 'Reduktion af manuelle fejl i rutinepræget kodning.']::text[], array['GitHub Copilot', 'Cursor', 'ChatGPT (GPT-4o)']::text[], false, true, 'da', 1),
  ('ai-empatisk-stoette-trivsel', 'AI som empatisk støtte: Fremtidens trivsel og mental sundhed', '#1', 'hr', 'low', 'quality', 'Mange medarbejdere oplever ensomhed, mental træthed eller mangel på en fortrolig samtalepartner i en travl hverdag, hvilket kan føre til nedsat trivsel og højere sygefravær.', 'Generativ AI fungerer som en virtuel ledsager, der tilbyder emotionel støtte, lytter uden fordomme og genererer empatiske svar for at hjælpe medarbejdere med at håndtere hverdagens udfordringer og mentale barrierer.', array['Reducerer barrieren for mental støtte ved at tilbyde en anonym og altid tilgængelig samtalepartner.', 'Forbedrer medarbejdertrivsel gennem daglig refleksion, humør-analyse og støtte til personlige gennembrud.', 'Frigør menneskelige ressourcer ved at lade AI håndtere lavpraktisk emotionel støtte og daglig strukturering af mentale opgaver.']::text[], array['ChatGPT', 'Pi (Inflection AI)', 'Woebot']::text[], false, true, 'da', 2),
  ('ai-katalysator-kreativitet', 'AI som katalysator for grænsebrydende kreativitet', '#9', 'marketing', 'medium', 'growth', 'Virksomheder begrænses ofte af traditionelle produktionsmetoder og budgetter til visuelt indhold.', 'Ved at bruge generative modeller til billeder, video og lyd kan virksomheder producere ''high-end'' kreativt indhold, der før var umuligt at skabe in-house.', array['Skalering af indholdsproduktion uden massive produktionsomkostninger.', 'Unik visuel differentiering i et mættet marked.', 'Mulighed for lynhurtigt at teste mange forskellige visuelle udtryk.']::text[], array['Midjourney', 'Adobe Firefly', 'Runway']::text[], false, true, 'da', 3),
  ('ai-sundhedsraadgivning-symptomcheck', 'AI Sundhedsrådgivning & Symptomcheck', '#26', 'hr', 'high', 'efficiency', 'Mange medarbejdere bruger tid i arbejdstiden på sundhedsspørgsmål, der kunne afklares hurtigt med korrekt information.', 'Avanceret AI analyserer symptomer og medicinske data for at give præcis, personlig vejledning og triagering.', array['Hurtigere afklaring af sundhedsspørgsmål, hvilket minimerer unødigt fravær.', 'Forbedret sundhedsprofil for medarbejdere gennem forebyggende råd.', 'Optimeret brug af virksomhedens sundhedsforsikring gennem korrekt triagering.']::text[], array['Ada Health', 'Babylon AI', 'Glass Health']::text[], false, true, 'da', 4),
  ('ai-assisteret-rapportskrivning-uddannelse', 'AI-assisteret Rapportskrivning og Uddannelse', '#23', 'hr', 'low', 'quality', 'Udarbejdelse af træningsmateriale og faglige rapporter er tidskrævende og resulterer ofte i tørt, uoverskueligt indhold.', 'Gen AI assisterer med at strukturere komplekse emner, lave outlines og udkast til velresearchede rapporter og kursusmateriale.', array['Hurtigere produktion af interne rapporter og uddannelsesdokumentation.', 'Forbedret kvalitet og struktur i skriftlig formidling på tværs af organisationen.', 'Effektiv hjælp til medarbejdere under efteruddannelse.']::text[], array['ChatGPT', 'Claude', 'Jasper']::text[], false, true, 'da', 5),
  ('ai-assisteret-troubleshooting', 'AI-assisteret Troubleshooting', '#16', 'it', 'medium', 'efficiency', 'Nedetid på maskiner eller systemer koster dyrt, og teknikerbesøg er langsomme og bekostelige.', 'AI analyserer fejlkoder, billeder af defekt hardware og historiske data for at give øjeblikkelige reparationsvejledninger.', array['Markant reduktion i Mean Time to Repair (MTTR).', 'Besparelser på eksterne konsulenter og mekanikere ved gør-det-selv løsninger.', 'Demokratisering af teknisk viden – alle kan udføre basal fejlfinding.']::text[], array['ChatGPT Vision', 'Claude 3.5 Sonnet', 'Fixit AI']::text[], false, true, 'da', 6),
  ('ai-baseret-mental-support-trivsel', 'AI-baseret Mental Support og Trivsel', '#25', 'hr', 'medium', 'quality', 'Medarbejdernes mentale sundhed er under pres, og adgang til øjeblikkelig sparring eller støtte er ofte begrænset.', 'AI-modeller fungerer som empatiske lyttepartnere eller virtuelle coaches, der tilbyder vejledning og mestringsstrategier i realtid.', array['Øget medarbejdertrivsel gennem let tilgængelig lavtærskel-støtte.', 'Reduktion i sygefravær relateret til stress gennem tidlig indsats.', 'Skaber et trygt rum for medarbejdere til at lufte tanker anonymt.']::text[], array['Woebot', 'Wysa', 'ChatGPT']::text[], false, true, 'da', 7),
  ('ai-drevet-interviewforberedelse', 'AI-drevet Interviewforberedelse', '#11', 'hr', 'low', 'quality', 'Kandidater og medarbejdere føler sig ofte uforberedte og stressede før vigtige samtaler, hvilket fører til underpræstation.', 'Gen AI simulerer realistiske interview-scenarier og giver øjeblikkelig feedback på svar, kropssprog og toneleje.', array['Øget selvtillid hos medarbejdere før interne og eksterne præsentationer.', 'Højere kvalitet i kandidat-screening gennem bedre forberedte interviewere.', 'Reduktion af stressrelaterede fejl under vigtige forretningskald.']::text[], array['ChatGPT Voice Mode', 'Claude', 'Interviewer.ai']::text[], false, true, 'da', 8),
  ('ai-drevet-projektplanlaegning', 'AI-drevet Projektplanlægning', '#20', 'operations', 'low', 'efficiency', 'Projekter fejler ofte på grund af urealistiske tidsplaner og manglende overblik over delopgaver.', 'Gen AI opstiller strukturerede planer, milepæle og opgavelister baseret på overordnede mål.', array['Hurtigere overgang fra idé til eksekverbar plan.', 'Bedre identifikation af potentielle flaskehalse i projektforløbet.', 'Øget gennemsigtighed og struktur i team-samarbejde.']::text[], array['Asana Intelligence', 'ChatGPT', 'Monday.com AI']::text[], false, true, 'da', 9),
  ('ai-genereret-underholdning-aktiviteter', 'AI-genereret Underholdning og Aktiviteter', '#21', 'marketing', 'low', 'quality', 'Virksomheder kæmper med at skabe engagerende og unikt indhold til familie-events eller kundesegmenter med børn.', 'Gen AI skaber personlige historier, interaktive spil og kreative opgaver, der er skræddersyet til specifikke aldersgrupper og temaer.', array['Øget kundeloyalitet gennem unikke, personaliserede oplevelser for børnefamilier.', 'Markant tidsbesparelse i planlægning af firma-events og workshops.', 'Mulighed for lynhurtigt at skalere kreative koncepter til forskellige platforme.']::text[], array['ChatGPT', 'Midjourney', 'StoryBird AI']::text[], false, true, 'da', 10),
  ('ai-understoettet-trivsel', 'AI-understøttet trivsel og sundhedsfremme', '#10', 'hr', 'low', 'quality', 'Medarbejdernes sundhed og trivsel er afgørende for produktiviteten, men personlig rådgivning er dyrt og svært at skalere.', 'Gen AI tilbyder personaliserede sundhedsplaner, kostvejledning og wellness-tips baseret på den enkelte medarbejders livsstil og mål.', array['Reduceret sygefravær gennem fokus på forebyggende sundhed.', 'Øget medarbejderenergi og fokus i løbet af arbejdsdagen.', 'En stærk værditilføjelse til virksomhedens personalegoder (Employer Branding).']::text[], array['MyFitnessPal (AI)', 'ChatGPT', 'Oura (AI insights)']::text[], false, true, 'da', 11),
  ('automatiseret-generering-juridiske-dokumenter', 'Automatiseret Generering af Juridiske Dokumenter', '#28', 'operations', 'high', 'efficiency', 'Udarbejdelse af standardkontrakter og juridiske dokumenter tager lang tid og er dyrt i advokatomkostninger.', 'Gen AI genererer skræddersyede juridiske udkast baseret på specifikke input, hvilket sikrer konsistens og korrekt formatering.', array['Markant besparelse på juridiske omkostninger ved standardiserede opgaver.', 'Hurtigere ekspeditionstid for kontrakter og aftaler.', 'Reduktion i menneskelige fejl gennem brug af præcise skabeloner.']::text[], array['Harvey AI', 'Ironclad', 'Spellbook']::text[], false, true, 'da', 12),
  ('automatiseret-generering-billeder', 'Automatiseret Generering af Relevante Billeder', '#12', 'marketing', 'medium', 'efficiency', 'Virksomheder bruger for mange ressourcer på stock-billeder eller dyre grafiske processer til blogs og sociale medier.', 'Gen AI skaber unikke, brand-specifikke billeder lynhurtigt baseret på tekstbeskrivelser.', array['Drastisk reduktion i omkostninger til stock-fotos og eksterne grafikere.', 'Hurtigere time-to-market for visuelt indhold til kampagner.', 'Unik visuel identitet uden risiko for at bruge de samme billeder som konkurrenter.']::text[], array['Midjourney', 'DALL-E 3', 'Canva Magic Design']::text[], false, true, 'da', 13),
  ('boost-selvtillid-beslutningskraft', 'Boost Selvtillid og Beslutningskraft', '#18', 'operations', 'low', 'quality', 'Usikkerhed hos medarbejdere fører til tøven og manglende initiativ i vigtige projekter.', 'AI fungerer som en sparringspartner, der bekræfter beslutninger, giver positiv feedback og perspektiverer udfordringer.', array['Hurtigere beslutningsprocesser ved at have en AI backup.', 'Større risikovillighed og innovation hos medarbejdere.', 'Forbedret psykologisk tryghed gennem objektiv feedback og støtte.']::text[], array['ChatGPT', 'Pi', 'Claude']::text[], false, true, 'da', 14),
  ('corporate-llm-intern-copilot', 'Corporate LLM & Intern Copilot', '#22', 'it', 'high', 'efficiency', 'Medarbejdere drukner i interne data og bruger for meget tid på at søge efter svar i ustrukturerede dokumenter.', 'Implementering af en lukket virksomheds-LLM, der fungerer som en intelligent assistent på tværs af dokumenter, support og dataanalyse.', array['Radikal forbedring af medarbejdernes produktivitet ved hurtig adgang til intern viden.', 'Sikker håndtering af følsomme data inden for virksomhedens eget setup.', 'Automatisering af rutineprægede supportopgaver og dokumentgenerering.']::text[], array['Azure OpenAI', 'Microsoft Copilot', 'Custom LLM stack']::text[], false, true, 'da', 15),
  ('eksponentiel-idegenerering', 'Eksponentiel idégenerering og konceptualisering', '#6', 'marketing', 'low', 'growth', 'Kreativ stilstand i marketing og produktudvikling hæmmer innovation og konkurrenceevne.', 'Gen AI fungerer som en uendelig kilde til kreative idéer, der kan kombinere datamønstre og trends til nye koncepter på sekunder.', array['10x flere idéer på kortere tid i brainstorming-sessioner.', 'Hurtigere identifikation af vindende kampagnekoncepter.', 'Billig eksperimentering med ''wildcard'' idéer uden risiko.']::text[], array['Claude.ai', 'Miro Assist', 'Midjourney']::text[], false, true, 'da', 16),
  ('engagement-kreativt-indhold', 'Engagement gennem kreativt og underholdende indhold', '#7', 'marketing', 'low', 'quality', 'Statisk og kedeligt indhold overses af kunderne, hvilket fører til lav brand-bevidsthed og engagement.', 'Gen AI bruges til at skabe sjovt, humoristisk og viralt potentiale gennem memes, skæve scenarier og kreativ leg med brandet.', array['Højere engagement på sociale medier gennem relevant humor.', 'Humanisering af brandet ved at vise personlighed og kreativitet.', 'Lavere omkostninger til produktion af ''lightweight'' underholdningsindhold.']::text[], array['Midjourney', 'Suno', 'ChatGPT']::text[], false, true, 'da', 17),
  ('formaalsdrevet-karriereudvikling', 'Formålsdrevet karriereudvikling og selvrefleksion', '#3', 'hr', 'medium', 'quality', 'Manglende retning og formål i arbejdet er en af de største årsager til medarbejderflugt og lavt engagement.', 'Ved hjælp af Gen AI kan medarbejdere gennemgå guidede refleksionsforløb, der matcher deres personlige værdier med virksomhedens mission og karrieremuligheder.', array['Højere medarbejderfastholdelse gennem øget arbejdsglæde og mening.', 'Bedre udnyttelse af medarbejdernes skjulte talenter og passioner.', 'Styrket virksomhedskultur baseret på fælles værdier.']::text[], array['Claude.ai', 'ChatGPT', 'Mindgrasp']::text[], false, true, 'da', 18),
  ('hyper-personaliseret-laering', 'Hyper-personaliseret læring og kompetenceløft', '#4', 'hr', 'low', 'quality', 'Standardiserede kurser rammer ofte ved siden af medarbejderens reelle behov, hvilket spilder tid og ressourcer.', 'Gen AI skaber interaktivt læringsindhold, der tilpasser sig den enkeltes stil, tempo og eksisterende viden, hvilket gør træningen langt mere effektiv.', array['Markant hurtigere opkvalificering af medarbejdere (upskilling).', 'Reduceret tidsforbrug på irrelevant træningsmateriale.', 'Instant feedback-loop, der sikrer korrekt indlæring fra start.']::text[], array['Learnai.nu Custom Tutor', 'Kajabi', 'ChatGPT Team']::text[], false, true, 'da', 19),
  ('hyper-specifik-vidensoegning', 'Hyper-specifik Vidensøgning', '#13', 'operations', 'low', 'efficiency', 'Medarbejdere spilder tid på at lede efter specifik information i massive datasæt eller gennem upræcise Google-søgninger.', 'AI-modeller syntetiserer information fra flere kilder og leverer direkte svar på komplekse, tekniske spørgsmål.', array['Markant tidsbesparelse ved research af tekniske komponenter eller regulativer.', 'Evnen til at identificere objekter eller dele via billedgenkendelse i felten.', 'Hurtigere beslutningstagning baseret på præcis informationssyntese.']::text[], array['Perplexity AI', 'ChatGPT Search', 'Glean']::text[], false, true, 'da', 20),
  ('intelligent-beskyttelse-mod-trolling', 'Intelligent Beskyttelse mod Trolling', '#30', 'marketing', 'medium', 'quality', 'Online communities og sociale medier kan hurtigt blive oversvømmet af negativitet og trolling, hvilket skader brandet.', 'AI detekterer skadelige kommentarer i realtid og foreslår moderationsstrategier eller konstruktive modsvar.', array['Beskyttelse af brandets omdømme gennem sundere online miljøer.', 'Besparelser på manuel moderation og community management.', 'Bedre kundeoplevelse i virksomhedens digitale kanaler.']::text[], array['OpenAI Moderation API', 'CleanSpeak', 'Perspective API']::text[], false, true, 'da', 21),
  ('intelligent-rejseplanlaegning-erhverv', 'Intelligent Rejseplanlægning for Erhverv', '#24', 'operations', 'low', 'efficiency', 'Planlægning af komplekse forretningsrejser med flere stop, møder og logistik er en administrativ byrde.', 'AI optimerer rejseplaner baseret på præferencer, tidsskemaer og budget, og leverer en fuldstændig optimeret ruteplan.', array['Drastisk reduktion i tidsforbrug på rejseadministration.', 'Bedre optimering af tid mellem møder, hvilket øger effektiviteten på farten.', 'Reducerede rejseomkostninger gennem AI-identificerede prisoptimeringer.']::text[], array['ChatGPT with Travel Plugins', 'Roam Around', 'Tripnotes']::text[], false, true, 'da', 22),
  ('intelligent-strukturering-arbejdsdag', 'Intelligent strukturering af arbejdsdag og prioriteter', '#2', 'operations', 'low', 'efficiency', 'Mange medarbejdere lider under ''information overload'' og har svært ved at prioritere opgaver, hvilket fører til stress og nedsat produktivitet.', 'Gen AI fungerer som en personlig driftsassistent, der analyserer opgavelister, deadlines og mål for at skabe en optimeret tidsplan og strukturere det fysiske og digitale arbejdsmiljø.', array['Øget output gennem bedre tidsstyring og eliminering af tidsrøvere.', 'Reduceret stressniveau hos medarbejdere grundet klarere overblik.', 'Bedre alignment mellem daglige opgaver og overordnede strategiske mål.']::text[], array['ChatGPT', 'Notion AI', 'Reclaim.ai']::text[], false, true, 'da', 23),
  ('konfliktloesning-maegling-ai', 'Konfliktløsning og Mægling med AI', '#27', 'hr', 'medium', 'quality', 'Personlige konflikter på arbejdspladsen kan eskalere og skade arbejdsmiljøet, hvis de ikke håndteres objektivt.', 'AI analyserer kommunikationsmønstre og tilbyder neutrale perspektiver samt mæglingsteknikker til at løse uoverensstemmelser.', array['Hurtigere løsning af interne tvister før de bliver til alvorlige HR-sager.', 'Fremmer en sundere feedback-kultur gennem objektive analyser.', 'Reduktion i stress og frustration hos de involverede parter.']::text[], array['ChatGPT', 'Claude', 'Cresta']::text[], false, true, 'da', 24),
  ('optimering-kodebase-refactoring', 'Optimering af eksisterende kodebase (Refactoring)', '#8', 'it', 'high', 'quality', 'Gammel kode (legacy code) og teknisk gæld gør systemer langsomme, usikre og svære at vedligeholde.', 'Gen AI analyserer eksisterende kode for at finde fejl, optimere ydeevnen og foreslå moderne alternativer, hvilket forbedrer systemstabiliteten.', array['Reduktion af teknisk gæld og vedligeholdelsesomkostninger.', 'Højere systemsikkerhed gennem automatisk fejlfinding.', 'Forbedret performance og hastighed i kritiske forretningssystemer.']::text[], array['GitHub Copilot', 'Cursor', 'SonarQube (AI features)']::text[], false, true, 'da', 25),
  ('personlig-laering-coaching', 'Personlig Læring og Coaching', '#17', 'hr', 'medium', 'quality', 'Traditionel efteruddannelse er ofte one-size-fits-all og ineffektiv til at lukke specifikke kompetencegab.', 'AI fungerer som en personlig tutor, der tilpasser undervisningsmateriale og sværhedsgrad til den enkelte medarbejder.', array['Hurtigere kompetenceudvikling gennem adaptiv læring.', '24/7 adgang til en tålmodig tutor, der aldrig mister overblikket.', 'Øget fastholdelse af viden gennem interaktive quizzer og feedback.']::text[], array['Khanmigo', 'ChatGPT Personal Tutor', 'Coursera Coach']::text[], false, true, 'da', 26),
  ('ressourceoptimering-kokkerer-med-hvad-du-har', 'Ressourceoptimering: Kokkerér med hvad du har', '#15', 'operations', 'low', 'efficiency', 'Spild af eksisterende ressourcer eller lagerbeholdning på grund af manglende overblik over anvendelsesmuligheder.', 'AI foreslår kreative løsninger eller opskrifter baseret udelukkende på de tilgængelige input og ingredienser.', array['Reduktion af madspild i kantiner og restaurationsbranchen.', 'Optimeret brug af eksisterende lagerbeholdning før nyindkøb.', 'Kreativ problemløsning i logistik ved at maksimere brug af tilgængelige midler.']::text[], array['ChatGPT Vision', 'Chef GPT', 'Custom GPTs']::text[], false, true, 'da', 27),
  ('simple-forklaringer-kompleks-dokumentation', 'Simple Forklaringer af Kompleks Dokumentation', '#14', 'operations', 'medium', 'quality', 'Tekniske manualer og API-dokumentation er ofte uforståelige for ikke-eksperter, hvilket skaber flaskehalse.', 'Gen AI nedbryder kompleks viden til letfordøjelige forklaringer (ELI5) skræddersyet til modtagerens niveau.', array['Frigør tid for specialister ved at lade AI besvare basale tekniske spørgsmål.', 'Forbedret kundeservice gennem hurtigere forståelse af komplekse sager.', 'Hurtigere onboarding af nye medarbejdere i komplekse systemer.']::text[], array['ChatPDF', 'NotebookLM', 'ChatGPT']::text[], false, true, 'da', 28),
  ('strategisk-sparring-dybe-dialoger', 'Strategisk Sparring og Dybe Dialoger', '#29', 'hr', 'medium', 'quality', 'Ledere og specialister mangler ofte en fortrolig partner til at udforske komplekse tanker og strategiske dilemmaer.', 'AI faciliterer reflekterende dialoger ved at stille udfordrende spørgsmål og give nye indsigter i en tryg ramme.', array['Styrket lederskab gennem dybere refleksion og selverkendelse.', 'Innovative løsninger på komplekse forretningsmæssige udfordringer.', 'Øget mental klarhed for nøglemedarbejdere.']::text[], array['Pi', 'ChatGPT Plus', 'Claude']::text[], false, true, 'da', 29),
  ('strategisk-tone-of-voice-justering', 'Strategisk Tone-of-Voice Justering', '#19', 'marketing', 'low', 'quality', 'E-mails og kommunikation kan ofte misforstås som konfrontatoriske eller uklare, hvilket skader relationer.', 'AI analyserer og omskriver tekster for at ramme den præcise ønskede tone (professionel, venlig, empatisk).', array['Færre konflikter i intern og ekstern korrespondance.', 'Sikrer at virksomhedens brand voice overholdes af alle.', 'Mere effektiv kommunikation til kulturelt forskelligartede modtagere.']::text[], array['Grammarly Business', 'Jasper', 'ChatGPT']::text[], false, true, 'da', 30)
on conflict (slug, locale) do nothing;

insert into public.resources (slug, title, type, url, description, rating, topics, published, locale, sort_order) values
  ('ai-first-the-playbook-for-a-future-proof-business-and-brand', 'AI First: The Playbook for a Future-Proof Business and Brand', 'bog', 'https://www.amazon.de/-/da/AI-First-Playbook-Future-Proof-Business/dp/1647829658/', 'Af Adam Brotman og Andy Sack. En praktisk guide til at fremtidssikre din virksomhed og dit brand med AI-first strategier.', null, array['Strategi', 'Business', 'Branding']::text[], true, 'da', 0),
  ('co-intelligence-living-and-working-with-ai', 'Co-Intelligence: Living and Working with AI', 'bog', 'https://www.amazon.de/-/da/Co-Intelligence-Definitive-Bestselling-Living-Working/dp/0753560771/', 'Af Ethan Mollick (Wharton professor). Den definitive guide til at leve og arbejde med AI i den nye æra af generativ kunstig intelligens.', null, array['Generativ AI', 'Produktivitet', 'Fremtiden']::text[], true, 'da', 1),
  ('rewired-the-mckinsey-guide-to-outcompeting-in-the-age-of-digital-and-ai', 'Rewired: The McKinsey Guide to Outcompeting in the Age of Digital and AI', 'bog', 'https://www.amazon.de/-/da/dp/1394381905', 'McKinsey-guide til digital transformation og hvordan virksomheder kan udkonkurrere i den digitale og AI-drevne tidsalder.', null, array['Digital transformation', 'McKinsey', 'Konkurrenceevne']::text[], true, 'da', 2),
  ('the-ai-driven-leader', 'The AI-Driven Leader', 'bog', 'https://www.amazon.de/-/da/Geoff-Woods/dp/B0GHYX8ZSM/', 'Af Geoff Woods. Lær hvordan du som leder kan udnytte AI til at træffe hurtigere og smartere beslutninger.', null, array['Ledelse', 'Beslutningstagning', 'AI-strategi']::text[], true, 'da', 3),
  ('56k', '56k', 'podcast', 'https://56kpodcast.dk/', 'Podcasten 56k giver dig Internettet på 30 minutter. Værterne Mads Viktor og Morten Saxnæs finder de bedste og mest saftige historier på Internettet og serverer dem i et skarpt og underholdende format.', 4.7, array['AI', 'teknologi', 'internetkultur', 'podcast']::text[], true, 'da', 4),
  ('ai-denmark', 'AI Denmark', 'podcast', 'https://open.spotify.com/show/3F2blLpAxsYnjRFsAx35jh', 'En podcast om kunstig intelligens set med danske briller.', null, array['AI', 'Danmark']::text[], true, 'da', 5),
  ('ai-for-alle', 'AI for alle', 'podcast', 'https://open.spotify.com/show/4tkjEEAMAHLIcscKtVHXpd', 'Podcasten er en del af AI for Alle - DIs strategiske indsats for at hjælpe danske virksomheder til at vinde med AI. Hver episode handler om et praktisk eksempel fra en af de mange AI-frontløbere i dansk erhvervsliv.', null, array['Business', 'DI', 'Case Studies']::text[], true, 'da', 6),
  ('ai-mennesker', 'AI Mennesker', 'podcast', 'https://open.spotify.com/show/76dGmnRMuRmahvDQGA4Rpc', 'Generativ AI vil forandre vores verden inden for få år. Spørgsmålet er hvad du vil gøre ved det? Techjournalist- og foredragsholder David Guldager dykker ned i hvad generativ AI er og hvordan det bliver brugt derude.', null, array['Generativ AI', 'Interviews']::text[], true, 'da', 7),
  ('ai-revolutionen', 'AI Revolutionen', 'podcast', 'https://open.spotify.com/show/1UaRk75DRUCN3bOT2tvSac', 'Velkommen til AI Revolutionen! Vi står midt i en ny tid, hvor ChatGPT, Grok, DeepSeek og selvkørende biler er ved at overtage kloden. Lyt med når vi dykker ned i de spændende AI-nyheder.', null, array['Tech News', 'AI Nyheder']::text[], true, 'da', 8),
  ('dataklubben', 'Dataklubben', 'podcast', 'https://open.spotify.com/show/4qlj4Uwh0CgZlTlDe0kHhv', 'Dataklubben er podcasten til dig med passion for data, analytics, digitalisering og transformation. Vi inviterer dig tæt på de entusiaster, som tør tale om ambitioner og dele de erfaringer, som skabte resultater.', null, array['Data', 'Analytics', 'Digitalisering']::text[], true, 'da', 9),
  ('edb-5-0', 'EDB 5.0', 'podcast', 'https://open.spotify.com/show/0JT4dvTrCJEzJjk0elBJDl', 'EDB 5.0 er en dansk teknologi podcast med fokus på kunstig intelligens og intelligent automatisering. Vi taler med landets førende virksomheder om kunstig intelligens, intelligent automation, data og data-etik.', null, array['Tech', 'Automation', 'Data-etik']::text[], true, 'da', 10),
  ('kpmg-tech-talk', 'KPMG Tech Talk', 'podcast', 'https://podcasts.apple.com/dk/podcast/kpmg-tech-talk/id1610516314', 'Podcastserie hvor førende erhvervsfolk og forskere taler om fremtidens teknologier - og de teknologier, du kan bruge allerede i dag.', null, array['Business', 'KPMG', 'Teknologi']::text[], true, 'da', 11),
  ('maskinstorm', 'Maskinstorm', 'podcast', 'https://open.spotify.com/show/7B7DBIlrIvH8j8lZdWdzIz', 'Hvordan vil kunstig intelligens forandre vores verden? I podcasten Maskinstorm inviterer Dagbladet Information eksperter i studiet for at forsøge at finde svar på netop det spørgsmål.', null, array['Society', 'Tech', 'Information']::text[], true, 'da', 12),
  ('prompt', 'Prompt', 'podcast', 'https://open.spotify.com/show/4yl5gZBKQWO3ap4r6Lrqqq', 'Hver uge går Prompt bag om tech-giganternes ''Ultra Pro Max''-løfter, bullshit-tester de nyeste tech-trends og spørger, om kunstig intelligens og AI er vores ven eller fjende. Sammen med tech-korrespondent Henrik Moltke nærlæser tech-analytiker Marcel Mirzaei-Fard de største historier om den teknologiske udvikling, der forandrer vores verden og muligheder.', null, array['Tech News', 'DR']::text[], true, 'da', 13),
  ('ai-explained', 'AI Explained', 'youtube', 'https://www.youtube.com/@aiexplained-official', 'Dybdegående analyser og forklaringer af de nyeste AI-modeller, forskningsartikler og teknologiske gennembrud. Kanalen fokuserer på at gøre komplekse AI-koncepter forståelige for alle.', null, array['AI-forskning', 'Maskinlæring', 'AI-modeller']::text[], true, 'da', 14),
  ('akm', 'AKM', 'youtube', 'https://www.youtube.com/@AKMofficial', 'AI-nyheder, produktanmeldelser og praktiske tips til at bruge kunstig intelligens i hverdagen.', null, array['AI-nyheder', 'Produktanmeldelser', 'AI-tips']::text[], true, 'da', 15),
  ('all-about-ai', 'All About AI', 'youtube', 'https://www.youtube.com/@AllAboutAI', 'Praktiske tutorials og guides til AI-værktøjer og workflows med fokus på hands-on anvendelse.', null, array['AI-tutorials', 'Praktiske guides', 'AI-workflows']::text[], true, 'da', 16),
  ('ibm-technology', 'IBM Technology', 'youtube', 'https://www.youtube.com/@IBMTechnology', 'Tekniske forklaringer af AI, cloud computing og enterprise-teknologi fra IBM eksperter.', null, array['Enterprise AI', 'Cloud Computing', 'Teknologi']::text[], true, 'da', 17),
  ('machine-learning-street-talk', 'Machine Learning Street Talk', 'youtube', 'https://www.youtube.com/@MachineLearningStreetTalk', 'Dybdegående samtaler med førende AI-forskere om machine learning, AGI og fremtiden for AI.', null, array['AI-forskning', 'Machine Learning', 'AGI']::text[], true, 'da', 18),
  ('matt-wolfe-mreflow', 'Matt Wolfe (mreflow)', 'youtube', 'https://www.youtube.com/@mreflow', 'Matt Wolfe dækker de nyeste AI-værktøjer, nyheder og automatiseringer. Han driver også FutureTools.io, en populær database med AI-værktøjer. Fantastisk kanal for at holde sig opdateret med AI-udviklingen.', null, array['AI-værktøjer', 'Automatisering', 'AI-nyheder']::text[], true, 'da', 19),
  ('openai', 'OpenAI', 'youtube', 'https://www.youtube.com/@OpenAI', 'Den officielle YouTube-kanal fra OpenAI, skaberne af ChatGPT, GPT-5 og DALL-E. Her finder du produktlanceringer, forskningspræsentationer og demoer af deres seneste AI-teknologier.', null, array['ChatGPT', 'GPT-5', 'AI-forskning']::text[], true, 'da', 20),
  ('skill-leap-ai', 'Skill Leap AI', 'youtube', 'https://www.youtube.com/@SkillLeapAI', 'Begyndervenlige tutorials til AI-værktøjer som ChatGPT, Midjourney og andre populære platforme.', null, array['AI-tutorials', 'Begynderguides', 'ChatGPT']::text[], true, 'da', 21)
on conflict (slug, locale) do nothing;
