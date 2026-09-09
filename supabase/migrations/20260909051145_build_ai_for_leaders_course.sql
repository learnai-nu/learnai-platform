-- Build the first editorially complete version of "AI for ledere".
-- The course deliberately starts in review status. Applying this migration must
-- never make an unfinished paid product publicly accessible.

insert into public.courses (
  id,
  status,
  title,
  slug,
  description,
  level,
  estimated_minutes,
  price_dkk,
  is_featured,
  published_at
)
values (
  md5('learnai:ai-for-ledere:course')::uuid,
  'review'::public.content_status,
  'AI for ledere – fra personlig praksis til teamledelse',
  'ai-for-ledere',
  'Brug AI i din egen lederhverdag, sæt ansvarlige rammer, styrk beslutninger og omsæt teknologien til målbar praksis i teamet.',
  'intermediate'::public.course_level,
  170,
  0,
  false,
  null
)
on conflict (slug) do update
set
  title = excluded.title,
  description = excluded.description,
  level = excluded.level,
  estimated_minutes = excluded.estimated_minutes,
  is_featured = false,
  status = case
    when public.courses.status = 'published'::public.content_status then public.courses.status
    else 'review'::public.content_status
  end,
  updated_at = now();

insert into public.course_modules (id, course_id, title, description, sort_order)
values
  (md5('learnai:ai-for-ledere:module:0')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Startmåling og din ledelsescase', 'Vælg en reel, lavrisiko opgave og gør dit udgangspunkt synligt.', 0),
  (md5('learnai:ai-for-ledere:module:1')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Dit ansvar som leder', 'Sæt retning, skab rammer og placér ansvaret rigtigt.', 1),
  (md5('learnai:ai-for-ledere:module:2')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'AI som personlig ledelsesassistent', 'Forbedr en konkret lederopgave uden at afgive dømmekraft.', 2),
  (md5('learnai:ai-for-ledere:module:3')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Ansvarlig brug, data og governance', 'Brug politik, datadisciplin og menneskelig kontrol som praktiske værktøjer.', 3),
  (md5('learnai:ai-for-ledere:module:4')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Kommunikation og svære samtaler', 'Brug AI som sparringspartner uden at miste din stemme eller relationen.', 4),
  (md5('learnai:ai-for-ledere:module:5')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Strategisk sparring og beslutninger', 'Udfordr antagelser og styrk beslutningsgrundlaget.', 5),
  (md5('learnai:ai-for-ledere:module:6')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Fra nysgerrighed til arbejdsvane', 'Design et målbart 90-dages forsøg med teamet.', 6),
  (md5('learnai:ai-for-ledere:module:7')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Ledelse af AI-agenter', 'Definér mandat, kontrol og menneskelig merværdi i hybride arbejdsgange.', 7),
  (md5('learnai:ai-for-ledere:module:8')::uuid, md5('learnai:ai-for-ledere:course')::uuid, 'Fra kursus til ledelsespraksis', 'Saml læringen i en personlig og organisatorisk handlingsplan.', 8)
on conflict (course_id, sort_order) do update
set
  title = excluded.title,
  description = excluded.description,
  updated_at = now();

-- Module 0
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:0')::uuid,
  md5('learnai:ai-for-ledere:module:0')::uuid,
  'Startmåling: Vælg din ledelsescase',
  'vaelg-din-ledelsescase',
  'Vælg én opgave, som følger dig gennem hele kurset, og mål dit udgangspunkt.',
  8,
  0,
  true,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"Du får mest ud af kurset, hvis du arbejder med én virkelig ledelsesopgave hele vejen. Vælg noget, der betyder nok til at være relevant, men som er ufarligt at eksperimentere med. Det kan være mødeforberedelse, prioritering, et beslutningsoplæg eller en besked til teamet."},
      {"type":"heading","text":"Vælg en god startcase"},
      {"type":"checklist","items":["Opgaven gentager sig eller tager unødigt meget mental energi.","Et bedre første udkast vil have reel værdi.","Du kan beskrive opgaven uden personfølsomme, kundehemmelige eller fortrolige oplysninger.","Du kan selv vurdere kvaliteten af resultatet.","En fejl vil kunne opdages og rettes, før noget sendes eller sættes i gang."]},
      {"type":"callout","text":"Begynd ikke med den vigtigste eller mest følsomme beslutning på dit bord. Begynd dér, hvor du kan lære hurtigt og sikkert."},
      {"type":"heading","text":"Mål dit udgangspunkt"},
      {"type":"paragraph","text":"Skriv ned, hvor lang tid opgaven normalt tager, hvad der kendetegner et godt resultat, og hvor du oftest går i stå. Det er din baseline. Uden en baseline kan du kun måle begejstring – ikke forbedring."},
      {"type":"example","text":"Jeg vil forbedre denne ledelsesopgave: [opgave]\n\nDen tager normalt: [minutter]\nEt godt resultat betyder: [tre kriterier]\nDen største risiko ved et dårligt resultat er: [risiko]\nAI må foreslå: [afgrænset del]\nJeg vil altid selv kontrollere: [kontrol]\nAI må ikke få eller gøre: [data eller handlinger]"},
      {"type":"heading","text":"Din første beslutning"},
      {"type":"paragraph","text":"Gem startkortet. Du vender tilbage til det efter hvert modul. Hvis du undervejs opdager, at opgaven kræver data eller adgang, du ikke må bruge, er det et godt resultat: Du har fundet grænsen, før du overskred den."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 1
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:1')::uuid,
  md5('learnai:ai-for-ledere:module:1')::uuid,
  'Hvad er dit ansvar som leder?',
  'dit-ansvar-som-leder',
  'Placér ansvar, beslutninger og næste skridt, når AI bliver en del af arbejdet.',
  18,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"AI bliver ikke til god praksis, fordi nogen køber licenser. Det sker, når ledelsen forbinder teknologien med et reelt mål, sætter tydelige grænser og giver medarbejderne tid til at lære. Du behøver ikke være teamets bedste AI-bruger. Du skal kunne stille de spørgsmål, der holder retning, ansvar og effekt samlet."},
      {"type":"heading","text":"Tre niveauer af ansvar"},
      {"type":"checklist","items":["Topledelsen beslutter retning, investeringer, risikotolerance og fælles governance.","Mellemlederen omsætter rammerne til konkrete arbejdsgange, forventninger og læring i teamet.","IT, jura, HR, sikkerhed og faglige specialister kvalificerer løsninger og grænser – men overtager ikke lederens beslutning om formål og praksis."]},
      {"type":"heading","text":"Fire ting du skal kunne svare på"},
      {"type":"checklist","items":["Retning: Hvilket problem eller mål skal AI hjælpe os med?","Rammer: Hvilke værktøjer, data og handlinger er tilladt?","Læring: Hvornår og hvordan lærer teamet i arbejdstiden?","Effekt: Hvilket resultat skal forbedres, og hvad gør vi, hvis det ikke sker?"]},
      {"type":"callout","text":"Det er troværdigt at sige: Det ved jeg ikke endnu, men her er hvem der afklarer det, og hvornår vi følger op. Uklarhed bliver farlig, når den skjules eller aldrig får en ejer."},
      {"type":"heading","text":"Case: Teamet er foran organisationen"},
      {"type":"paragraph","text":"Tre medarbejdere bruger private AI-konti, fordi de fælles værktøjer endnu ikke er besluttet. De deler gode resultater, men ingen kan forklare, hvilke data der er acceptable. Din opgave er ikke at love fri brug eller stoppe al læring. Din opgave er at skabe et sikkert midlertidigt rum: afgrænsede, offentlige eller fiktive data; ingen automatiske handlinger; en tydelig ansvarlig; og en fast dato for afklaring."},
      {"type":"example","text":"Hjælp mig med at udfylde et AI-ledelseskompas for mit team. Stil ét spørgsmål ad gangen under fire overskrifter:\n1. Det ved vi\n2. Det må vi\n3. Det prøver vi i en afgrænset periode\n4. Det afventer vi\n\nBed mig for hvert forsøg angive ejer, forventet effekt, datagrænse og dato for evaluering. Skriv ikke planen for mig, før du har stillet spørgsmålene."},
      {"type":"heading","text":"Anvend på din case"},
      {"type":"paragraph","text":"Skriv én sætning om formålet, én om rammen og én om effekten for din valgte case. Hvis du ikke kan placere ejerskabet, er næste handling at få det afklaret – ikke at fortsætte forsøget."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 2
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:2')::uuid,
  md5('learnai:ai-for-ledere:module:2')::uuid,
  'Gør AI til din personlige ledelsesassistent',
  'personlig-ledelsesassistent',
  'Brug AI til møder, overblik og prioritering med en arbejdsproces, du kan kontrollere.',
  20,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"De fleste begynder med at bede AI om at skrive. Som leder får du ofte større værdi ved at bruge den til at skabe overblik og skærpe en beslutningsramme. Målet er ikke at få AI til at tænke for dig, men at gøre din egen tænkning mere synlig og konsekvent."},
      {"type":"heading","text":"Start med den rigtige type opgave"},
      {"type":"checklist","items":["Før et møde: formål, beslutninger, agenda og kritiske spørgsmål.","Efter et møde: beslutninger, ansvar, deadlines og manglende afklaringer.","Prioritering: sortér opgaver efter effekt, konsekvens og mulighed for delegation.","Tidsblik: sammenlign kalenderens faktiske indhold med dine erklærede prioriteter."]},
      {"type":"callout","text":"Adgang til mail, kalender eller mødenoter ændrer risikobilledet. Brug kun integrationer, som organisationen har godkendt, og giv ikke bredere adgang end opgaven kræver."},
      {"type":"heading","text":"Fra agenda til beslutningsdesign"},
      {"type":"example","text":"Du er min strukturerende lederassistent. Jeg skal holde et møde om [emne].\nDeltagere: [roller, ikke nødvendigvis navne]\nTid: [minutter]\nDen vigtigste beslutning er: [beslutning]\n\nHjælp mig med at:\n1. formulere højst tre mål for mødet\n2. lave en realistisk agenda med tid\n3. finde tre kritiske spørgsmål\n4. skelne mellem det, vi kan beslutte, og det, der kræver mere viden\n5. markere hvilke oplysninger eller antagelser jeg selv skal kontrollere"},
      {"type":"heading","text":"Efter mødet"},
      {"type":"example","text":"Her er anonymiserede noter fra et møde: [noter]\n\nBrug kun oplysningerne i noterne. Lav:\n- et resumé på højst seks punkter\n- en liste over beslutninger\n- en handlingsliste med opgave, ansvarlig rolle og deadline\n- en liste over uafklarede spørgsmål\n\nSkriv ikke en ansvarlig eller deadline, hvis den ikke er oplyst. Skriv i stedet: mangler afklaring."},
      {"type":"heading","text":"Mål forbedringen"},
      {"type":"paragraph","text":"Kør din case én gang uden AI og én gang med din nye proces. Sammenlign tidsforbrug, antal nødvendige rettelser og kvalitet på dine tre kriterier. Gem kun prompten, hvis den gør arbejdet bedre – ikke bare hurtigere."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 3
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:3')::uuid,
  md5('learnai:ai-for-ledere:module:3')::uuid,
  'Ansvarlig brug: Data, bias og governance',
  'ansvarlig-brug-data-bias-governance',
  'Brug en enkel risikomodel, og gør organisationens regler anvendelige i hverdagen.',
  22,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"Ansvarlig AI-brug handler ikke om at kunne alle regler udenad. Det handler om at opdage, hvornår data, mennesker eller vigtige beslutninger øger konsekvensen – og vide, hvem der skal inddrages. Organisationens AI-politik og godkendte værktøjer er første reference. De erstatter ikke databeskyttelse, sikkerhed eller faglig vurdering."},
      {"type":"heading","text":"Et praktisk trafiklys"},
      {"type":"checklist","items":["Grøn: offentlige, fiktive eller ufølsomme oplysninger i et godkendt værktøj.","Gul: interne oplysninger eller materiale, der kan påvirke mennesker eller forretning. Afklar formål, adgang, nødvendighed og kontrol først.","Rød: adgangskoder, helbred, løn, personalesager, fortrolige kunderelationer eller data uden et klart lovligt og godkendt grundlag."]},
      {"type":"paragraph","text":"Farven afhænger ikke kun af data. En tekst til intern inspiration og en automatisk afgørelse om et menneske kan bruge samme input, men have helt forskellig konsekvens. Jo større konsekvens og autonomi, desto stærkere kontrol."},
      {"type":"heading","text":"Bias kan komme tre steder fra"},
      {"type":"checklist","items":["Data: historiske mønstre kan videreføre skævheder.","Prompten: et ledende spørgsmål kan få modellen til at bekræfte din framing.","Designet: valg af mål, kategorier og succesmål kan favorisere bestemte udfald."]},
      {"type":"example","text":"Jeg overvejer at bruge AI til [opgave]. Vurdér ikke om det er juridisk tilladt. Hjælp mig i stedet med at forberede de spørgsmål, jeg skal tage til vores ansvarlige.\n\nKortlæg:\n1. hvilke datatyper opgaven kræver\n2. hvem der påvirkes af outputtet\n3. konsekvensen ved fejl eller bias\n4. hvilken menneskelig kontrol der er nødvendig\n5. hvad der bør logges eller dokumenteres\n6. hvilke roller – fx IT, HR, jura, DPO eller compliance – der bør inddrages\n\nMarkér tydeligt alt, du ikke kan afgøre ud fra min beskrivelse."},
      {"type":"callout","text":"En chatbot er ikke din juridiske godkendelse. Brug den til at forberede spørgsmål og struktur – ikke til at erstatte organisationens ansvarlige eller gældende regler."},
      {"type":"heading","text":"Lav teamets spilleregler"},
      {"type":"paragraph","text":"Skriv tre ting teamet må bruge AI til, tre ting I ikke bruger AI til, og navnet eller rollen på den person, man spørger ved tvivl. Tilføj et krav om menneskelig godkendelse, før output påvirker kunder, medarbejdere, økonomi eller eksterne modtagere."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 4
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:4')::uuid,
  md5('learnai:ai-for-ledere:module:4')::uuid,
  'Kommunikér tydeligt – også i svære samtaler',
  'kommunikation-feedback-svaere-samtaler',
  'Brug AI til at skærpe budskaber og træne samtaler uden at automatisere relationen.',
  22,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"AI kan hurtigt gøre en tekst glat. Det er ikke det samme som at gøre den klar, sand eller brugbar. I ledelseskommunikation er din stemme og dit ansvar en del af budskabet. Brug derfor AI før og omkring formuleringen: til at finde formålet, modtagerens spørgsmål, mulige misforståelser og svage steder."},
      {"type":"heading","text":"Undgå workslop"},
      {"type":"paragraph","text":"Workslop er materiale, der ser færdigt ud, men mangler substans. Modtageren skal gætte, rette eller lave arbejdet om. Tegnene er generiske formuleringer, uklare handlinger, mange ord og ingen ny information. Som leder sætter du normen: AI må ikke bruges til at skubbe tænke- og kvalitetssikringsarbejdet videre til andre."},
      {"type":"example","text":"Her er mit udkast: [tekst]\nMålgruppen er: [målgruppe]\nFormålet er: [formål]\nDen ønskede handling er: [handling]\n\nLæs teksten som en travl og let skeptisk modtager. Peg på:\n- hvad der er uklart eller lyder som spin\n- hvilke spørgsmål teksten ikke besvarer\n- hvor ansvaret eller næste handling er utydelig\n- ord jeg sandsynligvis ikke selv ville bruge\n\nForeslå derefter højst fem præcise ændringer. Skriv ikke hele teksten om."},
      {"type":"heading","text":"Feedback og MUS kræver ekstra disciplin"},
      {"type":"paragraph","text":"AI kan hjælpe dig med at formulere åbne spørgsmål, gøre et udviklingsmål konkret og øve din levering gennem rollespil. Den må ikke bedømme medarbejderen, diagnosticere intentioner eller træffe personalebeslutninger. Brug fiktive roller og situationer frem for navne og personalesagsdetaljer."},
      {"type":"example","text":"Jeg vil øve en svær samtale. Du spiller en medarbejder, der oplever, at prioriteringerne skifter for ofte. Brug ingen antagelser om personens køn, alder, baggrund eller personlighed.\n\nStart med sætningen: Jeg ved ikke længere, hvad der faktisk er vigtigst.\n\nEfter fire udvekslinger stopper du rollespillet og giver mig feedback på:\n1. om jeg var tydelig om problemet\n2. om jeg stillede åbne spørgsmål\n3. om jeg tog ansvar for rammerne\n4. om næste skridt blev konkret\n\nDu må ikke skrive et endeligt HR-råd eller vurdere medarbejderen."},
      {"type":"callout","text":"AI kan gøre din forberedelse bedre. Selve relationen, nærværet og ansvaret kan ikke automatiseres."},
      {"type":"heading","text":"Fem spørgsmål før send"},
      {"type":"checklist","items":["Er kernebudskabet sandt og tydeligt?","Ved modtageren, hvorfor det vedkommer dem?","Er næste handling og ansvar klart?","Lyder det som mig og passer tonen til situationen?","Kan jeg stå på mål for hvert ord, også hvis AI har foreslået det?"]}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 5
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:5')::uuid,
  md5('learnai:ai-for-ledere:module:5')::uuid,
  'Brug AI som strategisk sparringspartner',
  'strategisk-sparringspartner',
  'Skeln mellem udførelse og sparring, og brug AI til at udfordre dit beslutningsgrundlag.',
  20,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"AI kan have to forskellige roller i strategiarbejdet. Som assistent kan den strukturere materiale, sammenligne input og formulere et udkast. Som sparringspartner kan den udfordre antagelser, vise alternativer og pege på manglende evidens. Værdien opstår, når du vælger rollen bevidst og ikke forveksler et velformuleret svar med en beslutning."},
      {"type":"heading","text":"Byg beslutningsgrundlaget før konklusionen"},
      {"type":"checklist","items":["Formulér beslutningen og kriterierne, før du beder om anbefalinger.","Skeln mellem fakta, antagelser og vurderinger.","Kontrollér kilder, tal og beregninger uden for chatten.","Bed om det stærkeste argument imod din foretrukne løsning.","Notér hvad der stadig mangler, og hvem der bør involveres."]},
      {"type":"heading","text":"En struktureret red team-dialog"},
      {"type":"example","text":"Du er kritisk sparringspartner – ikke beslutningstager. Jeg overvejer denne beslutning: [beslutning].\nMålet er: [mål]\nMine kriterier er: [kriterier]\nMit nuværende datagrundlag er: [grundlag]\n\nArbejd i fem trin, og vent på mit svar mellem hvert trin:\n1. Skeln mellem fakta, antagelser og vurderinger i min beskrivelse.\n2. Stil tre spørgsmål, der kan ændre beslutningen væsentligt.\n3. Formulér det stærkeste argument imod min foretrukne løsning.\n4. Beskriv to realistiske alternativer og deres afvejninger.\n5. Saml et beslutningsnotat med manglende evidens, risici og næste skridt.\n\nOpfind ikke kilder eller data. Markér tydeligt, når du ikke ved noget."},
      {"type":"heading","text":"Businesscase uden falsk præcision"},
      {"type":"paragraph","text":"AI kan hjælpe med interessenter, antagelser og scenarier, men et detaljeret regneark er ikke automatisk et solidt regnestykke. Bed om at få antagelser og beregningstrin vist. Test de vigtigste tal med en kollega eller den ansvarlige funktion."},
      {"type":"callout","text":"Den strategiske gevinst er ikke, at AI vælger for dig. Den er, at du opdager et svagt argument, en overset interessent eller en kritisk antagelse, før beslutningen bliver dyr."},
      {"type":"heading","text":"Anvend på din case"},
      {"type":"paragraph","text":"Tilføj én kritisk antagelse, én alternativ løsning og én manglende oplysning til dit startkort. Beslut derefter, hvad du selv kan kontrollere, og hvem der skal kvalificere resten."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 6
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:6')::uuid,
  md5('learnai:ai-for-ledere:module:6')::uuid,
  'Få teamet til at bruge AI med mening',
  'teamadoption-og-arbejdsvaner',
  'Gør AI til en tryg og målbar arbejdsvane gennem et afgrænset 90-dages forsøg.',
  25,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"Manglende brug er sjældent bare modstand mod teknologi. Medarbejdere kan mangle et relevant problem, adgang, tid, tydelige regler eller tillid til, hvad gevinsten skal bruges til. Adoption er derfor forandringsledelse: retning, rammer, læring, tryghed og opfølgning."},
      {"type":"heading","text":"Start med arbejdet – ikke værktøjet"},
      {"type":"paragraph","text":"Spørg ikke kun: Hvor kan vi bruge AI? Spørg: Hvilke gentagne arbejdsgange tager meget tid, skaber fejl eller forsinker vigtig værdi? Vælg få opgaver, hvor teamet kan se forskellen, og hvor risikoen kan holdes lav."},
      {"type":"example","text":"Jeg leder et team med ansvar for [kerneopgaver]. Vores vigtigste mål de næste 90 dage er [mål].\n\nStil mig otte spørgsmål, ét ad gangen, som hjælper mig med at finde gentagne arbejdsgange med høj tidsomkostning eller mange fejl.\n\nNår jeg har svaret, foreslår du højst tre kandidater til et afgrænset AI-forsøg. Vurdér hver kandidat på:\n- forventet effekt\n- nødvendige data og adgang\n- konsekvens ved fejl\n- mulighed for menneskelig kontrol\n- ét resultatmål og en baseline\n\nBegrund også, hvorfor de øvrige opgaver ikke bør vælges nu."},
      {"type":"heading","text":"Tre faser på 90 dage"},
      {"type":"checklist","items":["Dag 1-30: Vælg opgaven, mål udgangspunktet, sæt datagrænser og udpeg en ejer.","Dag 31-60: Afsæt læringstid i kalenderen, arbejd rollespecifikt og del både det, der virkede, og det, der fejlede.","Dag 61-90: Mål resultatet, standardisér den bedste arbejdsgang eller stop forsøget, og dokumentér hvorfor."]},
      {"type":"heading","text":"Mål resultat – og brug aktivitet som diagnose"},
      {"type":"paragraph","text":"Antal licenser og prompts kan vise, om nogen prøver. De viser ikke, om arbejdet er blevet bedre. Vælg et resultatmål som gennemløbstid, fejl, kvalitet, kundeværdi eller frigivet kapacitet. Bryd samtidig brugen ned på roller og erfaring, så et pænt gennemsnit ikke skjuler, hvem der mangler adgang eller støtte."},
      {"type":"callout","text":"Beslut hvad frigivet tid skal bruges til, før den frigives. Ellers bliver den ofte opslugt af almindelig travlhed, og gevinsten bliver usynlig."},
      {"type":"heading","text":"Skab psykologisk tryghed"},
      {"type":"checklist","items":["Gå selv synligt forrest, og del også fejl og begrænsninger.","Gør det legitimt at spørge, om en opgave ikke bør bruge AI.","Afsæt tid i arbejdstiden – ikke som ekstra hjemmearbejde.","Fortæl ærligt, hvad I vil opnå, og hvad forsøget ikke handler om.","Lad faglig dømmekraft være en eksplicit del af kompetencen."]}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 7
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:7')::uuid,
  md5('learnai:ai-for-ledere:module:7')::uuid,
  'Led AI-agenter med tydelige mandater',
  'ledelse-af-ai-agenter',
  'Forstå forskellen på assistenter og agenter, og design kontrol før automatisering.',
  20,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"En chatbot venter typisk på en opgave og leverer et svar. Et værktøjsforbundet system kan hente eller ændre oplysninger. En agent arbejder mod et mål med et mandat og kan tage flere skridt. Forskellen er ikke bare teknisk. Når systemet kan handle, flytter risikoen sig fra et dårligt udkast til en handling, der allerede er udført."},
      {"type":"heading","text":"Mandat før adgang"},
      {"type":"checklist","items":["Formål: Hvilket mål og hvilken værdi har agenten?","Opgaveområde: Hvilke situationer hører til – og hvilke gør ikke?","Adgang: Hvilke data og værktøjer er nødvendige?","Beslutningsrum: Hvad må agenten gøre selv?","Kontrol: Hvad kræver menneskelig godkendelse?","Eskalation: Hvornår stopper agenten, og hvem overtager?","Fejl: Hvordan opdages, rettes og dokumenteres en forkert handling?"]},
      {"type":"example","text":"Hjælp mig med at skrive et mandatkort til en mulig AI-agent. Agentens mål er: [mål].\n\nInterview mig ét område ad gangen om formål, opgaver, data, værktøjer, tilladte handlinger, forbudte handlinger, godkendelser, eskalation og logning.\n\nUdfordr enhver adgang, der ikke er nødvendig. Foreslå mindst tre realistiske fejlscenarier og et menneskeligt kontrolpunkt til hver.\n\nAfslut med en go/no-go-vurdering, men markér den som et beslutningsoplæg – ikke en godkendelse."},
      {"type":"heading","text":"Menneskets rolle i den hybride arbejdsgang"},
      {"type":"paragraph","text":"AI-agenter gør ikke automatisk mennesker overflødige. De ændrer ofte arbejdet. Nogen skal designe flowet, kontrollere kritiske resultater, håndtere undtagelser, sikre etik og kvalitet og udvikle opgaven videre. Som leder skal du definere, hvor menneskelig dømmekraft, relation, kreativitet og ansvar skaber den værdi, agenten ikke kan eje."},
      {"type":"heading","text":"Mål kvalitet – ikke travlhed"},
      {"type":"checklist","items":["Andel opgaver løst korrekt efter et tydeligt kriterium.","Antal og alvor af undtagelser eller fejl.","Hvor ofte et menneske må gribe ind, og om det sker det rigtige sted.","Tid og omkostning pr. brugbart resultat.","Konsekvens for kunder, medarbejdere og den samlede arbejdsgang."]},
      {"type":"callout","text":"Giv aldrig en agent mere adgang eller autonomi, end teamet kan overvåge, forklare og stoppe."},
      {"type":"heading","text":"Anvend på din case"},
      {"type":"paragraph","text":"Vurdér om din opgave fortsat bør være assistentstøttet. Hvis du overvejer en agent, skal du kunne beskrive tilladte handlinger, menneskelig godkendelse og stopkriterium. Kan du ikke det, er konklusionen endnu ikke no-go for evigt – men no-go nu."}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Module 8
insert into public.lessons (id, module_id, title, slug, description, estimated_minutes, sort_order, is_preview, body)
values (
  md5('learnai:ai-for-ledere:lesson:8')::uuid,
  md5('learnai:ai-for-ledere:module:8')::uuid,
  'Din 30- og 90-dages ledelsesplan',
  'din-ledelsesplan',
  'Saml ansvar, praksis, måling og læring i en plan, du kan tage med til teamet.',
  15,
  0,
  false,
  $json$
  {
    "format":"blocks",
    "blocks":[
      {"type":"paragraph","text":"Kurset er først færdigt, når du har omsat læringen til en beslutning. Du skal ikke starte ti initiativer. Vælg én personlig vane, én fælles arbejdsgang og ét tiltag, der gør rammerne tydeligere. De tre ting skal kunne følges op uden et stort rapporteringssystem."},
      {"type":"heading","text":"Gentag din selvvurdering"},
      {"type":"checklist","items":["AI-forståelse: dataindsigt, kritisk forståelse og kommunikation.","AI-brug: opgaveløsning og faglig udvikling.","AI-udvikling: design, krav til løsninger og problemløsning.","AI-forvaltning: implementering, forankring og ansvarlig praksis."]},
      {"type":"paragraph","text":"Vælg ikke automatisk det område, hvor du scorer lavest. Vælg det område, hvor en forbedring bedst understøtter dit ansvar og teamets mål nu."},
      {"type":"heading","text":"Din plan på én side"},
      {"type":"example","text":"Hjælp mig med at kvalitetssikre min 90-dages AI-plan. Du må ikke tilføje mål eller løfter, jeg ikke har givet dig.\n\nMin opgave eller arbejdsgang: [opgave]\nForretningsmål: [mål]\nBaseline: [udgangspunkt]\nSucceskriterium: [måleligt resultat]\nTilladte værktøjer og data: [ramme]\nMenneskelig kontrol: [hvem kontrollerer hvad]\nEjer: [rolle]\nLæringstid og rytme: [plan]\nKontrol efter 30 dage: [dato og spørgsmål]\nBeslutning efter 90 dage: [standardisér, justér eller stop]\nStopkriterium: [hvornår stopper vi straks]\nFrigivet tid bruges til: [prioritet]\n\nFind derefter uklarheder, skjulte antagelser og manglende ansvar. Stil højst fem spørgsmål. Lav først den endelige én-sides version, når jeg har svaret."},
      {"type":"heading","text":"Kvalitetstjek før du tager planen med videre"},
      {"type":"checklist","items":["Planen begynder med et arbejds- eller forretningsproblem.","Der er en baseline og ét primært resultatmål.","Data, værktøj og menneskelig kontrol er tydelige.","En navngiven rolle ejer forsøget og opfølgningen.","Teamet får tid til at lære og dele fejl.","Der er både en evalueringsdato og et stopkriterium.","Det er besluttet, hvad en eventuel gevinst skal bruges til."]},
      {"type":"callout","text":"Den stærkeste AI-plan er ikke den med flest initiativer. Det er den, hvor teamet ved, hvilket problem de løser, hvordan de arbejder sikkert, og hvad der skal være bedre om 90 dage."},
      {"type":"cta","title":"Vil I bygge planen sammen?","text":"LearnAI kan tilpasse forløbet til jeres værktøjer, AI-politik og konkrete arbejdsgange og facilitere den første 90-dages indsats.","label":"Se muligheder for virksomheder","href":"/virksomheder"}
    ]
  }
  $json$::jsonb
)
on conflict (module_id, slug) do update
set title = excluded.title, description = excluded.description, estimated_minutes = excluded.estimated_minutes,
    sort_order = excluded.sort_order, is_preview = excluded.is_preview, body = excluded.body, updated_at = now();

-- Final scenario-based quiz. Answer keys stay isolated in quiz_option_keys.
insert into public.quizzes (id, lesson_id, title, description, passing_score, max_attempts)
values (
  md5('learnai:ai-for-ledere:quiz')::uuid,
  md5('learnai:ai-for-ledere:lesson:8')::uuid,
  'Kan du lede AI ansvarligt i praksis?',
  '12 scenarier om ansvar, data, kommunikation, strategi, adoption og agenter.',
  75,
  null
)
on conflict (lesson_id) do update
set title = excluded.title, description = excluded.description, passing_score = excluded.passing_score,
    max_attempts = excluded.max_attempts, updated_at = now();

insert into public.quiz_questions (id, quiz_id, type, question, explanation, points, sort_order)
values
  (md5('learnai:ai-for-ledere:question:1')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Direktionen har sagt, at I skal bruge mere AI, men værktøjer og datarammer er uklare. Hvad er dit bedste første skridt som mellemleder?', 'Skab et sikkert, afgrænset rum: afklar rammerne og vælg én målbar lavrisiko-arbejdsgang. Hverken fri leg eller total stilstand placerer ansvaret godt.', 1, 1),
  (md5('learnai:ai-for-ledere:question:2')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvad er den mest værdifulde brug af AI før et vigtigt møde?', 'AI skaber mest værdi ved at hjælpe dig med mål, beslutningsramme, spørgsmål og manglende viden. Et pænt agendaudkast er sekundært.', 1, 2),
  (md5('learnai:ai-for-ledere:question:3')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Du vil finde mønstre i noter fra flere MUS-samtaler. Hvad gør du?', 'Medarbejderdata kræver særlig disciplin. Brug ikke rå noter i et tilfældigt værktøj; afklar grundlag og system, minimér data og anonymisér kun som led i en godkendt proces.', 1, 3),
  (md5('learnai:ai-for-ledere:question:4')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Prompten “Hvorfor virker hjemmearbejde dårligt?” giver en lang liste over problemer. Hvad bør du gøre?', 'Spørgsmålet indeholder allerede en konklusion. Neutral omformulering og flere perspektiver reducerer risikoen for, at AI blot bekræfter din framing.', 1, 4),
  (md5('learnai:ai-for-ledere:question:5')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Et AI-udkast ser professionelt ud, men modtageren skal selv finde formålet, kontrollere tallene og gætte næste skridt. Hvad er problemet?', 'Det er workslop: afsenderen har brugt AI til at flytte tænke- og rettearbejdet videre til modtageren.', 1, 5),
  (md5('learnai:ai-for-ledere:question:6')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvordan bruger du bedst AI som strategisk sparringspartner?', 'En strategisk sparringspartner skal udfordre antagelser, alternativer og manglende evidens. Beslutningen forbliver din.', 1, 6),
  (md5('learnai:ai-for-ledere:question:7')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'AI citerer tre rapporter som støtte for et beslutningsoplæg. Hvad er næste skridt?', 'En kildehenvisning er ikke dokumentation, før du har åbnet kilden og kontrolleret, at den findes og støtter påstanden.', 1, 7),
  (md5('learnai:ai-for-ledere:question:8')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvilket mål fortæller bedst, om teamets AI-forsøg har skabt værdi?', 'Gennemløbstid måler et arbejdsresultat. Licenser, prompts og kursusdeltagelse kan være nyttige aktivitetssignaler, men er ikke effekten.', 1, 8),
  (md5('learnai:ai-for-ledere:question:9')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Teamet forventer at frigive fem timer om ugen. Hvad skal lederen beslutte før forsøget?', 'Når den frigivne kapacitet får en tydelig prioritet på forhånd, kan gevinsten omsættes til værdi og følges op.', 1, 9),
  (md5('learnai:ai-for-ledere:question:10')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvad adskiller især en AI-agent fra en almindelig chatbot?', 'Agentens mål, værktøjsadgang og mandat til at tage flere skridt ændrer både arbejdsgang og risiko.', 1, 10),
  (md5('learnai:ai-for-ledere:question:11')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvornår skal menneskelig kontrol være stærkest?', 'Kontrollen skal stige med konsekvens, følsomhed og autonomi. Beslutninger om mennesker eller irreversible handlinger kræver stærk kontrol.', 1, 11),
  (md5('learnai:ai-for-ledere:question:12')::uuid, md5('learnai:ai-for-ledere:quiz')::uuid, 'single_choice', 'Hvilken 90-dages plan er mest handlingsklar?', 'En handlingsklar plan forbinder problem, baseline, mål, dataramme, kontrol, ejer, evaluering og stopkriterium.', 1, 12)
on conflict (id) do update
set quiz_id = excluded.quiz_id, type = excluded.type, question = excluded.question,
    explanation = excluded.explanation, points = excluded.points, sort_order = excluded.sort_order,
    updated_at = now();

insert into public.quiz_options (id, question_id, option_text, sort_order)
values
  (md5('learnai:ai-for-ledere:q1:o1')::uuid, md5('learnai:ai-for-ledere:question:1')::uuid, 'Lad alle bruge de værktøjer, de selv foretrækker, så læringen ikke bremses.', 1),
  (md5('learnai:ai-for-ledere:q1:o2')::uuid, md5('learnai:ai-for-ledere:question:1')::uuid, 'Afklar godkendte værktøjer og data, og vælg én lavrisiko-arbejdsgang med et effektmål.', 2),
  (md5('learnai:ai-for-ledere:q1:o3')::uuid, md5('learnai:ai-for-ledere:question:1')::uuid, 'Vent med enhver samtale om AI, til alle centrale politikker er perfekte.', 3),
  (md5('learnai:ai-for-ledere:q1:o4')::uuid, md5('learnai:ai-for-ledere:question:1')::uuid, 'Bed IT-afdelingen overtage hele implementeringen.', 4),
  (md5('learnai:ai-for-ledere:q2:o1')::uuid, md5('learnai:ai-for-ledere:question:2')::uuid, 'At få en flot dagsorden uden yderligere kontekst.', 1),
  (md5('learnai:ai-for-ledere:q2:o2')::uuid, md5('learnai:ai-for-ledere:question:2')::uuid, 'At få AI til at vælge beslutningen på forhånd.', 2),
  (md5('learnai:ai-for-ledere:q2:o3')::uuid, md5('learnai:ai-for-ledere:question:2')::uuid, 'At skærpe mål, beslutningsramme, kritiske spørgsmål og manglende viden.', 3),
  (md5('learnai:ai-for-ledere:q2:o4')::uuid, md5('learnai:ai-for-ledere:question:2')::uuid, 'At sende hele mailboksen til en gratis chatbot.', 4),
  (md5('learnai:ai-for-ledere:q3:o1')::uuid, md5('learnai:ai-for-ledere:question:3')::uuid, 'Upload rå noter, fordi formålet er positivt.', 1),
  (md5('learnai:ai-for-ledere:q3:o2')::uuid, md5('learnai:ai-for-ledere:question:3')::uuid, 'Fjern kun medarbejdernes fornavne og fortsæt.', 2),
  (md5('learnai:ai-for-ledere:q3:o3')::uuid, md5('learnai:ai-for-ledere:question:3')::uuid, 'Afklar godkendt system og grundlag, minimér data og brug kun nødvendige, korrekt anonymiserede oplysninger.', 3),
  (md5('learnai:ai-for-ledere:q3:o4')::uuid, md5('learnai:ai-for-ledere:question:3')::uuid, 'Bed AI love, at oplysningerne er sikre.', 4),
  (md5('learnai:ai-for-ledere:q4:o1')::uuid, md5('learnai:ai-for-ledere:question:4')::uuid, 'Brug svaret som dokumentation, fordi det er detaljeret.', 1),
  (md5('learnai:ai-for-ledere:q4:o2')::uuid, md5('learnai:ai-for-ledere:question:4')::uuid, 'Bed om endnu flere ulemper.', 2),
  (md5('learnai:ai-for-ledere:q4:o3')::uuid, md5('learnai:ai-for-ledere:question:4')::uuid, 'Omformulér neutralt og bed om fordele, ulemper, antagelser og flere perspektiver.', 3),
  (md5('learnai:ai-for-ledere:q4:o4')::uuid, md5('learnai:ai-for-ledere:question:4')::uuid, 'Skift model, men behold spørgsmålet uændret.', 4),
  (md5('learnai:ai-for-ledere:q5:o1')::uuid, md5('learnai:ai-for-ledere:question:5')::uuid, 'Teksten er for kort.', 1),
  (md5('learnai:ai-for-ledere:q5:o2')::uuid, md5('learnai:ai-for-ledere:question:5')::uuid, 'Teksten er workslop og flytter arbejdet videre til modtageren.', 2),
  (md5('learnai:ai-for-ledere:q5:o3')::uuid, md5('learnai:ai-for-ledere:question:5')::uuid, 'AI må aldrig bruges til skriftlig kommunikation.', 3),
  (md5('learnai:ai-for-ledere:q5:o4')::uuid, md5('learnai:ai-for-ledere:question:5')::uuid, 'Modtageren har ikke lært at læse AI-tekst.', 4),
  (md5('learnai:ai-for-ledere:q6:o1')::uuid, md5('learnai:ai-for-ledere:question:6')::uuid, 'Bed AI skrive den endelige strategi ud fra en kort overskrift.', 1),
  (md5('learnai:ai-for-ledere:q6:o2')::uuid, md5('learnai:ai-for-ledere:question:6')::uuid, 'Bed AI bekræfte den løsning, du allerede foretrækker.', 2),
  (md5('learnai:ai-for-ledere:q6:o3')::uuid, md5('learnai:ai-for-ledere:question:6')::uuid, 'Lad AI udfordre antagelser, alternativer, risici og manglende evidens.', 3),
  (md5('learnai:ai-for-ledere:q6:o4')::uuid, md5('learnai:ai-for-ledere:question:6')::uuid, 'Delegér den endelige beslutning, hvis svaret lyder sikkert.', 4),
  (md5('learnai:ai-for-ledere:q7:o1')::uuid, md5('learnai:ai-for-ledere:question:7')::uuid, 'Kopiér referencerne direkte ind i oplægget.', 1),
  (md5('learnai:ai-for-ledere:q7:o2')::uuid, md5('learnai:ai-for-ledere:question:7')::uuid, 'Bed AI gentage, at kilderne er pålidelige.', 2),
  (md5('learnai:ai-for-ledere:q7:o3')::uuid, md5('learnai:ai-for-ledere:question:7')::uuid, 'Åbn kilderne og kontrollér både eksistens, dato og støtte for påstanden.', 3),
  (md5('learnai:ai-for-ledere:q7:o4')::uuid, md5('learnai:ai-for-ledere:question:7')::uuid, 'Fjern kilderne, men behold konklusionen.', 4),
  (md5('learnai:ai-for-ledere:q8:o1')::uuid, md5('learnai:ai-for-ledere:question:8')::uuid, 'Antal købte licenser.', 1),
  (md5('learnai:ai-for-ledere:q8:o2')::uuid, md5('learnai:ai-for-ledere:question:8')::uuid, 'Antal prompts pr. medarbejder.', 2),
  (md5('learnai:ai-for-ledere:q8:o3')::uuid, md5('learnai:ai-for-ledere:question:8')::uuid, 'Andel der har gennemført et kursus.', 3),
  (md5('learnai:ai-for-ledere:q8:o4')::uuid, md5('learnai:ai-for-ledere:question:8')::uuid, 'Ændring i gennemløbstid for den valgte arbejdsgang.', 4),
  (md5('learnai:ai-for-ledere:q9:o1')::uuid, md5('learnai:ai-for-ledere:question:9')::uuid, 'Hvad den frigivne kapacitet konkret skal bruges til.', 1),
  (md5('learnai:ai-for-ledere:q9:o2')::uuid, md5('learnai:ai-for-ledere:question:9')::uuid, 'Hvem der har skrevet flest prompts.', 2),
  (md5('learnai:ai-for-ledere:q9:o3')::uuid, md5('learnai:ai-for-ledere:question:9')::uuid, 'Hvilket nyt værktøj der skal købes bagefter.', 3),
  (md5('learnai:ai-for-ledere:q9:o4')::uuid, md5('learnai:ai-for-ledere:question:9')::uuid, 'Hvordan gevinsten kan præsenteres uden baseline.', 4),
  (md5('learnai:ai-for-ledere:q10:o1')::uuid, md5('learnai:ai-for-ledere:question:10')::uuid, 'Agenten skriver altid længere svar.', 1),
  (md5('learnai:ai-for-ledere:q10:o2')::uuid, md5('learnai:ai-for-ledere:question:10')::uuid, 'Agenten har et mål, værktøjsadgang og et mandat til flere handlinger.', 2),
  (md5('learnai:ai-for-ledere:q10:o3')::uuid, md5('learnai:ai-for-ledere:question:10')::uuid, 'Agenten kan aldrig tage fejl.', 3),
  (md5('learnai:ai-for-ledere:q10:o4')::uuid, md5('learnai:ai-for-ledere:question:10')::uuid, 'Agenten behøver ikke menneskelig kontrol.', 4),
  (md5('learnai:ai-for-ledere:q11:o1')::uuid, md5('learnai:ai-for-ledere:question:11')::uuid, 'Når AI foreslår overskrifter til interne noter.', 1),
  (md5('learnai:ai-for-ledere:q11:o2')::uuid, md5('learnai:ai-for-ledere:question:11')::uuid, 'Når AI træffer eller udfører en beslutning med stor konsekvens for mennesker.', 2),
  (md5('learnai:ai-for-ledere:q11:o3')::uuid, md5('learnai:ai-for-ledere:question:11')::uuid, 'Når outputtet er kort.', 3),
  (md5('learnai:ai-for-ledere:q11:o4')::uuid, md5('learnai:ai-for-ledere:question:11')::uuid, 'Når mange andre virksomheder bruger samme model.', 4),
  (md5('learnai:ai-for-ledere:q12:o1')::uuid, md5('learnai:ai-for-ledere:question:12')::uuid, 'Vi skal bruge mere AI og følge op senere.', 1),
  (md5('learnai:ai-for-ledere:q12:o2')::uuid, md5('learnai:ai-for-ledere:question:12')::uuid, 'Alle skal skrive mindst 20 prompts om ugen.', 2),
  (md5('learnai:ai-for-ledere:q12:o3')::uuid, md5('learnai:ai-for-ledere:question:12')::uuid, 'Én arbejdsgang med baseline, resultatmål, dataramme, kontrol, ejer, evalueringsdato og stopkriterium.', 3),
  (md5('learnai:ai-for-ledere:q12:o4')::uuid, md5('learnai:ai-for-ledere:question:12')::uuid, 'En liste over ti AI-værktøjer, teamet kan undersøge.', 4)
on conflict (id) do update
set question_id = excluded.question_id, option_text = excluded.option_text, sort_order = excluded.sort_order;

insert into public.quiz_option_keys (option_id, is_correct)
select option_id, is_correct
from (values
  (md5('learnai:ai-for-ledere:q1:o1')::uuid, false), (md5('learnai:ai-for-ledere:q1:o2')::uuid, true), (md5('learnai:ai-for-ledere:q1:o3')::uuid, false), (md5('learnai:ai-for-ledere:q1:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q2:o1')::uuid, false), (md5('learnai:ai-for-ledere:q2:o2')::uuid, false), (md5('learnai:ai-for-ledere:q2:o3')::uuid, true), (md5('learnai:ai-for-ledere:q2:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q3:o1')::uuid, false), (md5('learnai:ai-for-ledere:q3:o2')::uuid, false), (md5('learnai:ai-for-ledere:q3:o3')::uuid, true), (md5('learnai:ai-for-ledere:q3:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q4:o1')::uuid, false), (md5('learnai:ai-for-ledere:q4:o2')::uuid, false), (md5('learnai:ai-for-ledere:q4:o3')::uuid, true), (md5('learnai:ai-for-ledere:q4:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q5:o1')::uuid, false), (md5('learnai:ai-for-ledere:q5:o2')::uuid, true), (md5('learnai:ai-for-ledere:q5:o3')::uuid, false), (md5('learnai:ai-for-ledere:q5:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q6:o1')::uuid, false), (md5('learnai:ai-for-ledere:q6:o2')::uuid, false), (md5('learnai:ai-for-ledere:q6:o3')::uuid, true), (md5('learnai:ai-for-ledere:q6:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q7:o1')::uuid, false), (md5('learnai:ai-for-ledere:q7:o2')::uuid, false), (md5('learnai:ai-for-ledere:q7:o3')::uuid, true), (md5('learnai:ai-for-ledere:q7:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q8:o1')::uuid, false), (md5('learnai:ai-for-ledere:q8:o2')::uuid, false), (md5('learnai:ai-for-ledere:q8:o3')::uuid, false), (md5('learnai:ai-for-ledere:q8:o4')::uuid, true),
  (md5('learnai:ai-for-ledere:q9:o1')::uuid, true), (md5('learnai:ai-for-ledere:q9:o2')::uuid, false), (md5('learnai:ai-for-ledere:q9:o3')::uuid, false), (md5('learnai:ai-for-ledere:q9:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q10:o1')::uuid, false), (md5('learnai:ai-for-ledere:q10:o2')::uuid, true), (md5('learnai:ai-for-ledere:q10:o3')::uuid, false), (md5('learnai:ai-for-ledere:q10:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q11:o1')::uuid, false), (md5('learnai:ai-for-ledere:q11:o2')::uuid, true), (md5('learnai:ai-for-ledere:q11:o3')::uuid, false), (md5('learnai:ai-for-ledere:q11:o4')::uuid, false),
  (md5('learnai:ai-for-ledere:q12:o1')::uuid, false), (md5('learnai:ai-for-ledere:q12:o2')::uuid, false), (md5('learnai:ai-for-ledere:q12:o3')::uuid, true), (md5('learnai:ai-for-ledere:q12:o4')::uuid, false)
) as answer_keys(option_id, is_correct)
on conflict (option_id) do update
set is_correct = excluded.is_correct, updated_at = now();
