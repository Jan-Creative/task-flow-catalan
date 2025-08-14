-- Afegir camp icon a la taula property_options per suportar icones personalitzades
ALTER TABLE public.property_options 
ADD COLUMN icon text;

-- Crear index per millorar el rendiment de cerques per icona
CREATE INDEX idx_property_options_icon ON public.property_options(icon) WHERE icon IS NOT NULL;