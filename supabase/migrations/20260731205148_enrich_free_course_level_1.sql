-- Enrich the free Level 1 course while preserving course, module and lesson IDs.
-- The content follows LearnAI's lesson model and the six-part prompt framework
-- from the existing ChatGPT course manuscript in Notion.

update public.courses
set
  title = 'AI i praksis – kom godt i gang på 60 minutter',
  description = 'Et gratis, praktisk introduktionskursus, hvor du lærer at vælge den rigtige AI-opgave, skrive bedre prompts og gennemføre dit første sikre AI-eksperiment.',
  estimated_minutes = 60,
  updated_at = now()
where slug = 'ai-i-praksis-dit-foerste-kursus';

update public.course_modules
set
  title = 'Forstå AI og vælg den rigtige opgave',
  description = 'Få en enkel mental model for generativ AI, og find opgaver hvor teknologien kan skabe reel værdi.',
  updated_at = now()
where id = '12a4fda9-807d-4ad7-8c30-cab2b8140bc6';

update public.course_modules
set
  title = 'Prompt med en metode, du kan genbruge',
  description = 'Brug LearnAI''s seks dele til at skabe klare instruktioner og forbedre resultatet trin for trin.',
  updated_at = now()
where id = 'be51f9a0-3124-48ac-8fd5-11f4ebf1d7aa';

update public.course_modules
set
  title = 'Gør AI til en sikker arbejdsvane',
  description = 'Beskyt data, kvalitetssikr resultatet og planlæg dit første målbare AI-eksperiment.',
  updated_at = now()
where id = '8297ca13-57d7-4e56-bf08-3914322e8df0';

update public.lessons
set
  title = 'Hvad generativ AI gør – og ikke gør',
  description = 'Få en enkel mental model, så du bruger AI som assistent i stedet for automatisk facit.',
  estimated_minutes = 8,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Generativ AI skaber nyt indhold ved at forudsige, hvad der sandsynligvis passer som det næste. Den kan formulere, strukturere og kombinere viden hurtigt, men den forstår ikke verden og dit arbejde på samme måde som et menneske."},
      {"type":"heading","text":"En enkel mental model"},
      {"type":"checklist","items":["Du giver AI et input: en opgave, kontekst eller et materiale.","Modellen finder mønstre og skaber et sandsynligt svar.","Du vurderer resultatet, retter fejl og beslutter, om det kan bruges."]},
      {"type":"callout","text":"Tænk på AI som en hurtig og kreativ assistent. Den kan levere et stærkt første udkast, men ansvaret for det færdige resultat er dit."},
      {"type":"heading","text":"Prøv det selv"},
      {"type":"paragraph","text":"Vælg et emne fra dit arbejde, som du kender godt. Bed AI forklare det til en ny kollega. Markér bagefter én ting, der er præcis, én ting der mangler, og én ting der bør kontrolleres."},
      {"type":"example","text":"Forklar [emnet] til en ny kollega på højst 150 ord. Brug et enkelt eksempel fra en dansk arbejdsplads. Afslut med to spørgsmål, jeg bør undersøge nærmere."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = 'c650d0a0-62b1-4af2-be1a-ed5c16042bdc';

update public.lessons
set
  title = 'Vælg opgaver, hvor AI skaber værdi',
  description = 'Brug tre spørgsmål til at finde en god og overskuelig første AI-opgave.',
  estimated_minutes = 8,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"AI giver mest værdi, når du starter med arbejdet – ikke værktøjet. Find en afgrænset opgave, som gentager sig, tager tid og har et resultat, du kan vurdere."},
      {"type":"heading","text":"De tre udvælgelsesspørgsmål"},
      {"type":"checklist","items":["Gentager opgaven sig ofte eller tager den unødigt lang tid?","Kan du give AI tilstrækkelig kontekst uden at dele følsomme data?","Kan et menneske hurtigt kontrollere, om resultatet er godt nok?"]},
      {"type":"heading","text":"Gode og dårlige startopgaver"},
      {"type":"example","text":"GOD START: Lav et første udkast til en agenda ud fra fem stikord.\nGOD START: Opsummér et offentligt dokument, du selv kan kontrollere.\nVENT: Træf en endelig beslutning om en medarbejder, kunde eller kontrakt.\nVENT: Behandl fortrolige data i et værktøj, organisationen ikke har godkendt."},
      {"type":"paragraph","text":"Skriv tre opgaver fra din egen uge. Vælg den opgave, der både er hyppig, lavrisiko og nem at kvalitetssikre. Det bliver din øvelsesopgave resten af kurset."},
      {"type":"callout","text":"Den bedste første AI-case er sjældent den mest spektakulære. Det er den mindste opgave, hvor du kan se en tydelig forbedring i tid eller kvalitet."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '6aa2c93a-e7b5-4019-a360-0ee4449ec572';

update public.lessons
set
  title = 'Byg en stærk prompt med seks dele',
  description = 'Brug opgave, kontekst, format, tone, rolle og eksempel som en genbrugelig promptmodel.',
  estimated_minutes = 12,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"En god prompt gør det let for AI at forstå både opgaven og dine kvalitetskrav. Din oprindelige LearnAI-model består af seks dele, som kan kombineres efter behov."},
      {"type":"heading","text":"De seks dele"},
      {"type":"checklist","items":["Opgave – hvad skal AI konkret levere?","Kontekst – hvem, hvad og hvorfor skal modellen kende?","Format – liste, tabel, trin, længde eller anden struktur.","Tone – professionel, enkel, varm, nøgtern eller noget femte.","Rolle – hvilken relevant ekspertise skal AI arbejde ud fra?","Eksempel – vis et mønster eller en stil, hvis resultatet skal ligne noget bestemt."]},
      {"type":"callout","text":"Du behøver ikke bruge alle seks dele hver gang. Start med opgave og kontekst, og tilføj de øvrige, når de gør kvalitetskravene tydeligere."},
      {"type":"heading","text":"Fra vag til brugbar"},
      {"type":"example","text":"ROLLE: Du er en erfaren kommunikationsrådgiver.\nOPGAVE: Skriv et første udkast til et LinkedIn-opslag.\nKONTEKST: Målgruppen er danske SMV-ledere, som er nysgerrige på AI, men mangler tid. Formålet er at vise tre lavrisiko-gevinster.\nFORMAT: Højst 120 ord, en tydelig åbning og tre korte punkter.\nTONE: Nøgtern, praktisk og uden hype.\nEKSEMPEL: Brug konkrete formuleringer som 'spar tid på første udkast' frem for brede løfter om transformation."},
      {"type":"paragraph","text":"Omskriv nu din valgte øvelsesopgave med mindst fire af de seks dele. Sammenlign svaret med det, du ville have fået fra en prompt på én linje."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = 'ddcb7b10-e68e-403d-bcff-cc155b964807';

update public.lessons
set
  title = 'Forbedr resultatet i fire iterationer',
  description = 'Gør det første svar bedre med kritik, præcisering, revision og kvalitetstjek.',
  estimated_minutes = 9,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Det første AI-svar er et udkast, ikke slutproduktet. Du får ofte et bedre resultat ved at arbejde i korte iterationer end ved at forsøge at skrive én perfekt megaprompt."},
      {"type":"heading","text":"Fire trin til et bedre svar"},
      {"type":"checklist","items":["Kritik: Bed AI finde de tre største svagheder i sit svar.","Præcisering: Tilføj den kontekst eller det kvalitetskrav, der mangler.","Revision: Bed om en ny version med de konkrete forbedringer.","Kontrol: Tjek fakta, tone, data og om resultatet løser den oprindelige opgave."]},
      {"type":"example","text":"1. Hvilke tre dele af dit svar er mest generiske eller dårligt underbyggede?\n2. Revider svaret. Prioritér konkrete handlinger og fjern gentagelser.\n3. Lav til sidst en kort kontrol: Hvilke påstande bør jeg selv faktatjekke?"},
      {"type":"heading","text":"Prøv på din egen opgave"},
      {"type":"paragraph","text":"Kør de fire trin på svaret fra forrige lektion. Gem både første og sidste version. Skriv én sætning om, hvilken ændring der forbedrede resultatet mest."},
      {"type":"callout","text":"God prompting er en samtale med tydelige kvalitetskriterier – ikke en konkurrence i at skrive den længste instruktion."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '05aee99b-a99f-4ac9-92a9-5a81b69a5770';

update public.lessons
set
  title = 'Beskyt data med en trafiklysmodel',
  description = 'Vurdér information som grøn, gul eller rød, før du deler den med et AI-værktøj.',
  estimated_minutes = 10,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Før du indsætter tekst, billeder eller dokumenter i et AI-værktøj, skal du kende både organisationens regler og værktøjets datavilkår. En enkel trafiklysmodel hjælper dig med at stoppe op i tide."},
      {"type":"heading","text":"Grøn, gul og rød information"},
      {"type":"checklist","items":["GRØN: Offentlig information og materiale, som allerede må deles.","GUL: Internt materiale uden persondata eller forretningskritiske oplysninger. Brug kun godkendte værktøjer og anonymisér, når det er muligt.","RØD: Persondata, kundedata, adgangskoder, helbredsoplysninger, fortrolige aftaler og forretningshemmeligheder. Del ikke uden udtrykkelig godkendelse og korrekt løsning."]},
      {"type":"example","text":"I stedet for: 'Skriv et svar til kunden Anne Jensen om hendes sag nr. 2841 og vedlagte betaling.'\nBrug: 'Skriv et venligt standardsvar til en kunde, der spørger til status på en forsinket betaling. Brug ingen navne, sagsnumre eller beløb.'"},
      {"type":"paragraph","text":"Gennemgå din øvelsesopgave. Fjern navne, numre og detaljer, som AI ikke behøver for at løse opgaven. Hvis du er i tvivl, så brug et fiktivt eksempel eller spørg den ansvarlige i din organisation."},
      {"type":"callout","text":"Ansvarlig AI starter før prompten: Del kun de data, opgaven kræver, i et værktøj der er godkendt til formålet."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '703d7841-2c4b-4547-8c5f-504088686de8';

update public.lessons
set
  title = 'Gennemfør dit første 7-dages AI-eksperiment',
  description = 'Kvalitetssikr dit output, mål effekten og beslut, hvad du vil lære som det næste.',
  estimated_minutes = 13,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Du har nu en opgave, en promptmetode og en sikker arbejdsgang. Afslut kurset med et lille eksperiment, der viser, om AI faktisk forbedrer din arbejdsdag."},
      {"type":"heading","text":"Kontrollér altid resultatet"},
      {"type":"checklist","items":["Fakta: Kan vigtige påstande bekræftes i en troværdig kilde?","Formål: Løser resultatet den opgave, du faktisk stillede?","Tone og kvalitet: Passer sproget til modtageren og din organisation?","Data: Er personlige eller fortrolige oplysninger fjernet?","Ansvar: Er et menneske klar til at stå på mål for det færdige resultat?"]},
      {"type":"heading","text":"Din 7-dages plan"},
      {"type":"checklist","items":["Vælg én tilbagevendende, lavrisiko-opgave.","Brug den samme seksparts-prompt mindst tre gange.","Notér tiden før og efter samt én kvalitetsforskel.","Gem den bedste prompt som en skabelon.","Beslut efter syv dage: stop, justér eller gør arbejdsgangen til en fast vane."]},
      {"type":"example","text":"OPGAVE: [den konkrete opgave]\nNUVÆRENDE TIDSFORBRUG: [minutter]\nAI-METODE: [prompt og iterationer]\nKVALITETSKONTROL: [hvad kontrollerer jeg?]\nRESULTAT EFTER 7 DAGE: [tid, kvalitet og læring]\nNÆSTE FORBEDRING: [én konkret ændring]"},
      {"type":"callout","text":"Målet er ikke at bruge AI mest muligt. Målet er at skabe en bedre arbejdsgang, som du kan forklare, kontrollere og gentage."},
      {"type":"cta","title":"Klar til at gå fra prompts til workflows?","text":"Niveau 2 lærer dig at kortlægge en arbejdsgang, bygge genbrugelige AI-processer og måle værdien i et lille pilotprojekt.","label":"Kom på ventelisten til Niveau 2","href":"/kurser/ai-i-arbejdet"}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = '854dd459-c182-4797-ac6e-a67d1a59aa66';

-- Allow anonymous waitlist signups through the existing RLS-protected table.
-- Anonymous callers can only insert the fields used by the public form.
grant insert (email, first_name, source)
on table public.newsletter_subscribers
to anon;
