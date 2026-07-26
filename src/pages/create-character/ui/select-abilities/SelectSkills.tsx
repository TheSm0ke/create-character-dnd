import {
  Alert,
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useEffect, useMemo } from "react";
import { fetchSkills, type Class, type Race, type Skill } from "../../../../api";
import { useFetch } from "../../../../api/useFetch";
import type { AbilityScores } from "./abilityScores";

interface SelectSkillsProps {
  selectedClass: Class;
  selectedRace: Race;
  scores: AbilityScores;
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
}

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase("ru-RU").replace(/ё/g, "е");

const getRaceSkillNames = (race: Race, skills: Skill[]) => {
  const explicitSkills = race.skill_proficiencies ?? [];
  const traitDescriptions = race.traits.map((trait) => normalize(trait.description));

  return skills
    .filter((skill) => {
      const normalizedSkillName = normalize(skill.name);
      const isExplicitlyGranted = explicitSkills.some(
        (name) => normalize(name) === normalizedSkillName,
      );
      const isMentionedInTrait = traitDescriptions.some((description) => {
        const proficiencyIndex = description.indexOf("владение навык");

        return (
          proficiencyIndex !== -1 &&
          description
            .slice(proficiencyIndex, proficiencyIndex + 160)
            .includes(normalizedSkillName)
        );
      });

      return isExplicitlyGranted || isMentionedInTrait;
    })
    .map((skill) => skill.name);
};

const getEffectiveScore = (skill: Skill, scores: AbilityScores) => {
  const abilityScores: Record<string, number> = {
    "Сила": scores.str,
    "Ловкость": scores.dex,
    "Телосложение": scores.con,
    "Интеллект": scores.int,
    "Мудрость": scores.wis,
    "Харизма": scores.cha,
  };

  return abilityScores[skill.ability] ?? 0;
};

export const SelectSkills = ({
  selectedClass,
  selectedRace,
  scores,
  selectedSkills,
  onChange,
}: SelectSkillsProps) => {
  const { data: allSkills, loading, error } = useFetch(fetchSkills);

  const raceSkills = useMemo(
    () => getRaceSkillNames(selectedRace, allSkills ?? []),
    [allSkills, selectedRace],
  );
  const availableSkills = useMemo(
    () =>
      (allSkills ?? [])
        .filter((skill) => selectedClass.proficiencies.skills.list.includes(skill.name))
        .filter((skill) => !raceSkills.includes(skill.name))
        .sort((first, second) =>
          getEffectiveScore(second, scores) - getEffectiveScore(first, scores),
        ),
    [allSkills, raceSkills, scores, selectedClass.proficiencies.skills.list],
  );
  const availableSkillNames = useMemo(
    () => availableSkills.map((skill) => skill.name),
    [availableSkills],
  );
  const skillsToChoose = selectedClass.proficiencies.skills.number_to_choose;
  const highestScore = Math.max(
    ...availableSkills.map((skill) => getEffectiveScore(skill, scores)),
  );

  useEffect(() => {
    if (!allSkills) return;

    const validSkills = selectedSkills.filter((skill) =>
      availableSkillNames.includes(skill),
    );

    if (validSkills.length !== selectedSkills.length) {
      onChange(validSkills);
    }
  }, [allSkills, availableSkillNames, onChange, selectedSkills]);

  const handleToggle = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      onChange(selectedSkills.filter((skill) => skill !== skillName));
      return;
    }

    if (selectedSkills.length < skillsToChoose) {
      onChange([...selectedSkills, skillName]);
    }
  };

  if (skillsToChoose === 0) return null;

  return (
    <Box component="section" aria-labelledby="skills-selection-title" sx={{ mt: 4 }}>
      <Typography id="skills-selection-title" variant="h5" color="common.white">
        Выберите основные навыки ({selectedSkills.length}/{skillsToChoose})
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
        Доступны навыки класса «{selectedClass.name}». Сначала показаны навыки,
        использующие ваши самые высокие характеристики с учётом бонусов расы.
      </Typography>

      {raceSkills.length > 0 && (
        <Alert severity="info" sx={{ mb: 2, textAlign: "left" }}>
          Раса «{selectedRace.name}» уже даёт владение: {raceSkills.join(", ")}.
          Эти навыки исключены из выбора класса, чтобы не было дублей.
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error">
          Не удалось загрузить навыки: {error}
        </Alert>
      )}

      {!loading && !error && availableSkills.length === 0 && (
        <Alert severity="warning">
          Для выбранного класса нет доступных навыков. Проверьте справочник навыков.
        </Alert>
      )}

      {!loading && !error && availableSkills.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {availableSkills.map((skill) => {
            const selected = selectedSkills.includes(skill.name);
            const disabled = !selected && selectedSkills.length >= skillsToChoose;
            const effectiveScore = getEffectiveScore(skill, scores);
            const recommended = effectiveScore === highestScore;

            return (
              <Card
                key={skill._id}
                variant="outlined"
                sx={{
                  borderColor: selected ? "primary.main" : "rgba(255,255,255,0.14)",
                  backgroundColor: selected
                    ? "rgba(170, 59, 255, 0.12)"
                    : "rgba(255,255,255,0.03)",
                  opacity: disabled ? 0.55 : 1,
                }}
              >
                <CardActionArea
                  onClick={() => handleToggle(skill.name)}
                  disabled={disabled}
                  aria-pressed={selected}
                >
                  <CardContent sx={{ minHeight: 128 }}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 1,
                        mb: 1,
                      }}
                    >
                      <Typography variant="h6" color="common.white">
                        {skill.name}
                      </Typography>
                      {selected && <Chip label="Выбран" color="primary" size="small" />}
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                      <Chip label={skill.ability} size="small" variant="outlined" />
                      <Chip label={`Характеристика: ${effectiveScore}`} size="small" />
                      {recommended && (
                        <Chip label="Рекомендуется" color="secondary" size="small" />
                      )}
                    </Box>
                    {skill.description && (
                      <Typography variant="body2" color="text.secondary">
                        {skill.description}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
