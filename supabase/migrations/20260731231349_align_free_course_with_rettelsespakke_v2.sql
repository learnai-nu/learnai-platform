-- Align the free introductory course with LearnAI's Rettelsespakke v2.
-- The paid four-week course remains the source product; this free course is a
-- focused sample that preserves all existing course/module/lesson IDs so user
-- progress, lesson URLs and the secure final quiz remain intact.

update public.courses
set
  title = 'AI i praksis – din første AI-gevinst på 60 minutter',
  description = 'Et gratis minikursus baseret på LearnAI-forløbet "AI som dit daglige værktøj". Få et brugbart resultat med det samme, lær det vigtigste håndværk og brug AI sikkert og troværdigt.',
  estimated_minutes = 60,
  updated_at = now()
where slug = 'ai-i-praksis-dit-foerste-kursus';

update public.course_modules
set
  title = 'Få dit første resultat',
  description = 'Start med en konkret gevinst, og forstå bagefter hvorfor AI kan hjælpe – og hvorfor den også kan tage fejl.',
  updated_at = now()
where id = '12a4fda9-807d-4ad7-8c30-cab2b8140bc6';

update public.course_modules
set
  title = 'Byg en skabelon, du kan genbruge',
  description = 'Lær de fire byggesten og forbedr resultatet gennem korte, målrettede iterationer.',
  updated_at = now()
where id = 'be51f9a0-3124-48ac-8fd5-11f4ebf1d7aa';

update public.course_modules
set
  title = 'Brug AI sikkert og troværdigt',
  description = 'Beskyt data, gør kontrol til en vane, og vælg dit næste skridt mod en mere effektiv AI-hverdag.',
  updated_at = now()
where id = '8297ca13-57d7-4e56-bf08-3914322e8df0';

update public.lessons
set
  title = 'Quick win: Få styr på en lang mailtråd',
  description = 'Få et brugbart resultat med det samme med en færdig skabelon fra LearnAI-forløbet.',
  estimated_minutes = 10,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Før vi forklarer, hvordan AI fungerer, skal du have et resultat. Åbn ChatGPT, Claude eller Copilot i en fane ved siden af denne lektion. Vi tager fat på den lange mailtråd: mange beskeder frem og tilbage, og du skal hurtigt forstå, hvad der er besluttet, og hvad der forventes af dig."},
      {"type":"heading","text":"Kopiér denne skabelon"},
      {"type":"example","text":"Her er en mailtråd. Svar på tre ting:\n1) Hvad er der besluttet?\n2) Hvad er uafklaret?\n3) Hvad forventes konkret af mig?\n\nForeslå derefter et udkast til mit svar.\n\n[INDSÆT TRÅD]"},
      {"type":"heading","text":"Prøv den nu"},
      {"type":"checklist","items":["Find en mailtråd, der er svær at overskue.","Kontrollér først, at den ikke indeholder persondata, kundedata eller fortrolige oplysninger.","Brug en fiktiv eller anonymiseret tråd, hvis du er i tvivl.","Indsæt skabelonen og vurder, om svaret giver dig 80 procent af det, du har brug for.","Ret selv de sidste 20 procent, før noget bliver sendt."]},
      {"type":"callout","text":"Hvis det virkede fint, halvt eller slet ikke, har du allerede lært noget nyttigt. Resten af kurset viser, hvorfor skabelonen virker, og hvordan du bygger dine egne."},
      {"type":"paragraph","text":"Skabelonen virker, fordi den giver AI en tydelig opgave, den nødvendige kontekst og et konkret format. Det håndværk folder vi ud om lidt."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = 'c650d0a0-62b1-4af2-be1a-ed5c16042bdc';

update public.lessons
set
  title = 'Sådan “tænker” en sprogmodel',
  description = 'Forstå hvorfor AI kan skrive overbevisende – og stadig tage fejl med fuld selvtillid.',
  estimated_minutes = 8,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Du har lige set AI arbejde. Nu får du forklaringen – også hvis mailøvelsen ikke helt virkede. En sprogmodel slår ikke automatisk sandheden op. Den forudsiger, hvad der sandsynligvis kommer som det næste, ud fra mønstre i meget store mængder tekst."},
      {"type":"heading","text":"Den vigtigste mentale model"},
      {"type":"checklist","items":["Du giver modellen en opgave og noget kontekst.","Modellen skaber et sandsynligt svar ord for ord.","Svaret kan være velformuleret uden at være korrekt eller dækkende.","Du vurderer, retter og tager ansvaret for det færdige resultat."]},
      {"type":"callout","text":"Tænk på AI som en lynhurtig assistent til første udkast – ikke som et automatisk facit."},
      {"type":"heading","text":"To konsekvenser for dit arbejde"},
      {"type":"paragraph","text":"For det første bliver resultatet bedre, når du er tydelig om opgave, kontekst og format. For det andet kan modellen tage fejl med fuld selvtillid, netop fordi den forudsiger ord i stedet for altid at kontrollere fakta."},
      {"type":"paragraph","text":"I kursets sidste lektion får du de tre kontrolvaner, som beskytter din troværdighed. Indtil da: Brug AI til lavrisiko-opgaver, og kontrollér alt, der skal videre til andre."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '6aa2c93a-e7b5-4019-a360-0ee4449ec572';

update public.lessons
set
  title = 'De fire byggesten i en brugbar prompt',
  description = 'Byg dine egne skabeloner med rolle, kontekst, opgave og format.',
  estimated_minutes = 12,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Du fik én færdig skabelon udleveret i første lektion. Nu lærer du at bygge dem selv – til hvilken som helst af dine opgaver. Håndværket starter med fire byggesten."},
      {"type":"heading","text":"De fire byggesten"},
      {"type":"checklist","items":["Rolle – hvilken relevant faglighed eller synsvinkel skal AI arbejde ud fra?","Kontekst – hvad skal modellen vide om situation, målgruppe og formål?","Opgave – hvad skal den helt konkret gøre?","Format – hvordan skal resultatet leveres: længde, struktur, tabel, punkter eller andet?"]},
      {"type":"callout","text":"Gå tilbage til mailtråds-skabelonen. Opgaven og formatet stod direkte i teksten. Konteksten kom fra selve mailtråden, og rollen lå implicit i ønsket om et svarudkast. Byggestenene var der hele tiden."},
      {"type":"heading","text":"Fra vag til brugbar"},
      {"type":"example","text":"ROLLE: Du er en erfaren kommunikationsrådgiver.\nKONTEKST: Jeg skriver til danske SMV-ledere, som er nysgerrige på AI, men mangler tid.\nOPGAVE: Skriv et første udkast til et LinkedIn-opslag om tre lavrisiko-gevinster ved AI.\nFORMAT: Højst 120 ord, en tydelig åbning og tre korte punkter."},
      {"type":"paragraph","text":"Vælg nu en lille, tilbagevendende opgave fra dit arbejde. Skriv en prompt med alle fire byggesten, og gem den – den er begyndelsen på din første genbrugelige AI-skabelon."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = 'ddcb7b10-e68e-403d-bcff-cc155b964807';

update public.lessons
set
  title = 'Fra første udkast til noget, du vil bruge',
  description = 'Forbedr svaret i korte iterationer, tilføj din tone og gem den færdige skabelon.',
  estimated_minutes = 10,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Det første svar er et udkast, ikke slutproduktet. Du får ofte et bedre resultat gennem en kort samtale end ved at forsøge at skrive én enorm og perfekt prompt."},
      {"type":"heading","text":"Fire enkle iterationer"},
      {"type":"checklist","items":["Kritik: Bed AI pege på de tre største svagheder i sit eget svar.","Præcisering: Tilføj den kontekst eller det kvalitetskrav, der mangler.","Tone: Beskriv hvordan du selv skriver – eksempelvis direkte, varm og uden konsulentsprog.","Revision: Bed om en ny version og kontrollér, om den faktisk løser opgaven."]},
      {"type":"example","text":"Hvilke tre dele af svaret er mest generiske eller dårligt underbyggede?\n\nRevider derefter svaret. Skriv direkte og nøgternt, fjern gentagelser, og brug konkrete handlinger frem for brede løfter.\n\nMarkér til sidst de påstande, jeg selv bør kontrollere."},
      {"type":"heading","text":"Gem det, der virker"},
      {"type":"paragraph","text":"Sammenlign første og sidste version. Notér den ændring, der løftede kvaliteten mest. Gem derefter prompten med en titel, du kan finde igen. Så skal du ikke begynde forfra næste gang."},
      {"type":"callout","text":"God prompting er tydelige kvalitetskrav og en kort samtale – ikke en konkurrence i at skrive den længste instruktion."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '05aee99b-a99f-4ac9-92a9-5a81b69a5770';

update public.lessons
set
  title = 'Datasikkerhed, GDPR og sund fornuft',
  description = 'Lær, hvad du aldrig bør dele, og hvordan du kan anonymisere en rigtig arbejdsopgave.',
  estimated_minutes = 9,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Husk, at mailtråden i første lektion helst skulle være fiktiv eller anonymiseret. Før du indsætter tekst, billeder eller dokumenter i et AI-værktøj, skal du kende både arbejdspladsens regler og værktøjets datavilkår."},
      {"type":"heading","text":"Brug trafiklyset før du trykker send"},
      {"type":"checklist","items":["GRØN: Offentligt materiale og information, der allerede må deles.","GUL: Internt materiale uden persondata eller forretningskritiske oplysninger. Brug kun godkendte værktøjer, og anonymisér når det er muligt.","RØD: Persondata, kundedata, adgangskoder, helbredsoplysninger, fortrolige aftaler og forretningshemmeligheder. Del ikke uden en udtrykkeligt godkendt løsning."]},
      {"type":"heading","text":"Bevar opgaven – fjern identiteten"},
      {"type":"example","text":"UNDGÅ: Skriv et svar til kunden Anne Jensen om sag 2841 og den vedlagte betaling.\n\nBRUG I STEDET: Skriv et venligt standardsvar til en kunde, der spørger til status på en forsinket betaling. Brug ingen navne, sagsnumre eller beløb."},
      {"type":"paragraph","text":"Gennemgå din egen skabelon. Fjern navne, numre og detaljer, som AI ikke behøver. Hvis du er i tvivl, så brug et fiktivt eksempel eller spørg den ansvarlige i organisationen."},
      {"type":"callout","text":"Ansvarlig AI starter før prompten: Del kun de data, opgaven kræver, i et værktøj der er godkendt til formålet."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '703d7841-2c4b-4547-8c5f-504088686de8';

update public.lessons
set
  title = 'De tre kontrolvaner – og dit næste skridt',
  description = 'Beskyt din troværdighed, prøv skabelonen i syv dage, og se vejen til det fulde LearnAI-forløb.',
  estimated_minutes = 11,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"AI kan levere et detaljeret, velformuleret og selvsikkert svar, som stadig er forkert. Hallucinationer kommer uden advarsel og i samme tone som de rigtige svar. Derfor skal tre kontrolvaner sidde på rygraden."},
      {"type":"heading","text":"Vane 1: Bed om kilder – og tjek dem"},
      {"type":"example","text":"Hvilke kilder bygger det på? Giv mig titler og fortæl, hvor jeg kan finde dem."},
      {"type":"paragraph","text":"Åbn kilderne. AI kan også opdigte rapporter, årstal og links. En kilde, du ikke har tjekket, er bare en påstand med en fodnote."},
      {"type":"heading","text":"Vane 2: Spørg om usikkerheden"},
      {"type":"example","text":"Hvor sikker er du på svaret? Hvad taler imod, og hvilke dele bør jeg selv verificere?"},
      {"type":"paragraph","text":"Når du spørger direkte, bliver modellen ofte mere tydelig om begrænsningerne. Gør spørgsmålet til en refleks, når noget betyder noget."},
      {"type":"heading","text":"Vane 3: Dit navn, dit ansvar"},
      {"type":"paragraph","text":"Alt, der forlader dig – mailen, referatet eller tallet i præsentationen – er dit i det øjeblik, du sender det. Lad AI hjælpe med formulering, struktur og første udkast. Fakta, tal, navne og påstande, der skal videre til andre, verificerer du selv."},
      {"type":"callout","text":"Skalér bekymringen rigtigt: En mail i din egen tone eller et referat af dine noter er typisk lavrisiko, når du læser det igennem. Risikoen vokser, når AI skal levere fakta, tal, kilder eller jura fra sin egen hukommelse."},
      {"type":"heading","text":"Dit syvdages eksperiment"},
      {"type":"checklist","items":["Brug din nye skabelon på den samme lavrisiko-opgave mindst tre gange.","Notér tidsforbruget før og efter – vær konservativ og ærlig.","Kontrollér data, fakta, tone og formål hver gang.","Gem den bedste version af skabelonen.","Beslut efter syv dage: stop, justér eller gør den til en fast arbejdsvane."]},
      {"type":"cta","title":"Klar til at spare 2–5 timer om ugen?","text":"Det fulde forløb “AI som dit daglige værktøj” fører dig gennem fire praktiske uger, tre bonuslektioner og to live-workshops. Du arbejder med dine egne opgaver, bygger en digital kollega og dokumenterer din reelle tidsbesparelse.","label":"Se forløbet og kom på ventelisten","href":"/kurser/ai-i-arbejdet"}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '854dd459-c182-4797-ac6e-a67d1a59aa66';

update public.quizzes
set
  title = 'Har du de vigtigste AI-vaner?',
  description = 'Test om du kan vælge en god AI-opgave, beskytte data og kontrollere resultatet.',
  updated_at = now()
where lesson_id = '854dd459-c182-4797-ac6e-a67d1a59aa66';

