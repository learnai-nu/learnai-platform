-- Replace the long-email exercise with a lower-friction guided challenge dialogue.
-- The interactive coach is implemented in the application; this migration keeps
-- the canonical course copy and later lesson references aligned with that flow.

update public.lessons
set
  title = 'Få sparring på en aktuel udfordring',
  description = 'Beskriv noget, du står med lige nu. AI stiller tre opklarende spørgsmål, før du får et konkret forslag.',
  estimated_minutes = 12,
  body = $json$
  {
    "format": "blocks",
    "blocks": [
      {"type":"paragraph","text":"Du behøver ikke begynde med et langt dokument eller en perfekt prompt. Tag i stedet udgangspunkt i en aktuel udfordring, hvor du har brug for et nyt perspektiv."},
      {"type":"paragraph","text":"Beskriv situationen med dine egne ord. AI stiller derefter tre spørgsmål for at forstå den bedre, før du får en anbefaling og et konkret første skridt."},
      {"type":"callout","text":"Undgå personfølsomme, fortrolige og kundespecifikke oplysninger. Beskriv roller og situationer generelt, hvis andre personer indgår."}
    ]
  }
  $json$::jsonb,
  updated_at = now()
where id = 'c650d0a0-62b1-4af2-be1a-ed5c16042bdc';

update public.lessons
set
  body = jsonb_set(
    body,
    '{blocks,0,text}',
    to_jsonb('Du har lige brugt AI som sparringspartner. Nu får du forklaringen – også hvis det første forslag ikke helt ramte. En sprogmodel slår ikke automatisk sandheden op. Den forudsiger, hvad der sandsynligvis kommer som det næste, ud fra mønstre i meget store mængder tekst.'::text)
  ),
  updated_at = now()
where id = '6aa2c93a-e7b5-4019-a360-0ee4449ec572';

update public.lessons
set
  body = jsonb_set(
    body,
    '{blocks,2,text}',
    to_jsonb('Gå tilbage til sparringsøvelsen. Din udfordring gav konteksten, og de tre spørgsmål gjorde mål og begrænsninger tydeligere. Først derefter fik AI opgaven med at anbefale et næste skridt. Byggestenene opstod gennem samtalen.'::text)
  ),
  updated_at = now()
where id = 'ddcb7b10-e68e-403d-bcff-cc155b964807';

update public.lessons
set
  body = jsonb_set(
    body,
    '{blocks,0,text}',
    to_jsonb('I første lektion beskrev du en aktuel udfordring med egne ord. Før du indsætter tekst, billeder eller dokumenter i et AI-værktøj, skal du kende både arbejdspladsens regler og værktøjets datavilkår.'::text)
  ),
  updated_at = now()
where id = '703d7841-2c4b-4547-8c5f-504088686de8';
