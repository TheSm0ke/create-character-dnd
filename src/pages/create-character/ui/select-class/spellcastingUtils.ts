import type { Spellcasting } from "../../../../api";

export const hasSpellcasting = (spellcasting?: Spellcasting): spellcasting is Spellcasting =>
  Boolean(
    spellcasting?.ability &&
      (spellcasting.cantrips_known_progression?.some((count) => count > 0) ||
        spellcasting.spells_known_progression?.some((count) => count > 0) ||
        spellcasting.spell_slots_progression?.some(({ slots }) =>
          slots.some((count) => count > 0),
        ) ||
        spellcasting.prepared_spells_formula ||
        spellcasting.pact_magic),
  );
