import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMemo, useState, type DragEvent } from "react";
import type { AbilityKey, Background, Class, Race } from "../../../../api";
import {
  STANDARD_ARRAY,
  createAbilityScores,
  isAbilityScoresValid,
  type AbilityScores,
} from "./abilityScores";
import { SelectSkills } from "./SelectSkills";

const ABILITIES: Array<{
  key: AbilityKey;
  name: string;
  shortName: string;
  generalHint: string;
}> = [
  {
    key: "str",
    name: "Сила",
    shortName: "СИЛ",
    generalHint: "Рукопашные атаки, атлетика и переносимый вес.",
  },
  {
    key: "dex",
    name: "Ловкость",
    shortName: "ЛОВ",
    generalHint: "Класс доспеха, инициатива, скрытность и дальние атаки.",
  },
  {
    key: "con",
    name: "Телосложение",
    shortName: "ТЕЛ",
    generalHint: "Запас хитов и спасброски для поддержания концентрации.",
  },
  {
    key: "int",
    name: "Интеллект",
    shortName: "ИНТ",
    generalHint: "Знания, расследование и некоторые виды магии.",
  },
  {
    key: "wis",
    name: "Мудрость",
    shortName: "МДР",
    generalHint: "Внимательность, проницательность и защита от контроля.",
  },
  {
    key: "cha",
    name: "Харизма",
    shortName: "ХАР",
    generalHint: "Общение, влияние и магия харизматичных заклинателей.",
  },
];

const ABILITY_ALIASES: Record<string, AbilityKey> = {
  str: "str",
  strength: "str",
  сила: "str",
  сил: "str",
  dex: "dex",
  dexterity: "dex",
  ловкость: "dex",
  лов: "dex",
  con: "con",
  constitution: "con",
  телосложение: "con",
  выносливость: "con",
  тел: "con",
  int: "int",
  intelligence: "int",
  интеллект: "int",
  инт: "int",
  wis: "wis",
  wisdom: "wis",
  мудрость: "wis",
  мдр: "wis",
  cha: "cha",
  charisma: "cha",
  харизма: "cha",
  хар: "cha",
};

const emptyBonuses = (): AbilityScores => ({
  str: 0,
  dex: 0,
  con: 0,
  int: 0,
  wis: 0,
  cha: 0,
});

const normalizeAbilityName = (value: string): AbilityKey | null => {
  const normalized = value
    .trim()
    .toLocaleLowerCase("ru-RU")
    .replace(/[._-]/g, " ");
  return ABILITY_ALIASES[normalized] ?? null;
};

const formatModifier = (value: number) => {
  const modifier = Math.floor((value - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : String(modifier);
};

interface SelectAbilitiesProps {
  selectedClass: Class;
  selectedRace: Race;
  selectedBackground: Background;
  scores: AbilityScores;
  selectedSkills: string[];
  onChange: (scores: AbilityScores) => void;
  onSkillsChange: (skills: string[]) => void;
}

export const SelectAbilities = ({
  selectedClass,
  selectedRace,
  selectedBackground,
  scores,
  selectedSkills,
  onChange,
  onSkillsChange,
}: SelectAbilitiesProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [draggedAbility, setDraggedAbility] = useState<AbilityKey | null>(null);

  const recommendedScores = useMemo(
    () => createAbilityScores(selectedClass.recommended_stats),
    [selectedClass.recommended_stats],
  );

  const raceBonuses = useMemo(() => {
    const result = emptyBonuses();

    selectedRace.ability_bonuses.forEach(({ ability, bonus }) => {
      const key = normalizeAbilityName(ability);
      if (key) result[key] += bonus;
    });

    return result;
  }, [selectedRace.ability_bonuses]);

  const primaryAbility = normalizeAbilityName(selectedClass.primary_ability);
  const spellcastingAbility = selectedClass.spellcasting?.ability
    ? normalizeAbilityName(selectedClass.spellcasting.ability)
    : null;
  const isValid = isAbilityScoresValid(scores);
  const values = ABILITIES.map(({ key }) => scores[key]);
  const totalPoints = values.reduce((sum, value) => sum + value, 0);

  const updateScore = (key: AbilityKey, value: number) => {
    onChange({ ...scores, [key]: value });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, target: AbilityKey) => {
    event.preventDefault();
    if (!draggedAbility || draggedAbility === target) return;

    onChange({
      ...scores,
      [draggedAbility]: scores[target],
      [target]: scores[draggedAbility],
    });
    setDraggedAbility(null);
  };

  const getHint = (key: AbilityKey, generalHint: string) => {
    const reasons: string[] = [];

    if (key === primaryAbility) {
      reasons.push(`основная характеристика класса «${selectedClass.name}»`);
    }
    if (key === spellcastingAbility) {
      reasons.push("определяет атаки заклинаниями и сложность спасбросков");
    }
    if (key === "con" && selectedClass.spellcasting) {
      reasons.push("помогает сохранять концентрацию на заклинаниях");
    }

    return reasons.length > 0
      ? `${generalHint} Для этого класса: ${reasons.join("; ")}.`
      : generalHint;
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 1180, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ textAlign: "left" }}>
          <Typography variant={isMobile ? "h5" : "h4"} color="common.white">
            Распределите характеристики
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 0.75 }}>
            Перетащите карточку на другую, чтобы поменять значения местами, или
            введите число вручную.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => onChange({ ...recommendedScores })}
          sx={{ flexShrink: 0 }}
        >
          Вернуть рекомендации
        </Button>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2.5,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1,
          borderColor: "rgba(212, 175, 55, 0.35)",
          textAlign: "left",
        }}
      >
        <Typography color="text.secondary">Основа:</Typography>
        {STANDARD_ARRAY.map((value) => {
          const used = values.includes(value);
          return (
            <Chip
              key={value}
              label={value}
              color={used ? "secondary" : "default"}
              variant={used ? "filled" : "outlined"}
              size="small"
            />
          );
        })}
        <Typography
          variant="body2"
          sx={{
            ml: { sm: "auto" },
            color: isValid ? "success.light" : "warning.light",
          }}
        >
          Использовано:{" "}
          {
            values.filter((value) =>
              STANDARD_ARRAY.some((item) => item === value),
            ).length
          }
          /6 · Сумма: {totalPoints}/72
        </Typography>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(3, minmax(0, 1fr))",
          },
          gap: 2,
        }}
      >
        {ABILITIES.map(({ key, name, shortName, generalHint }) => {
          const baseValue = scores[key];
          const raceBonus = raceBonuses[key];
          const totalValue = baseValue + raceBonus;
          const recommendedValue = recommendedScores[key];
          const isPriority =
            key === primaryAbility ||
            key === spellcastingAbility ||
            recommendedValue >= 14;
          const followsRecommendation = baseValue === recommendedValue;

          return (
            <Paper
              key={key}
              component="div"
              draggable
              onDragStart={() => setDraggedAbility(key)}
              onDragEnd={() => setDraggedAbility(null)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => handleDrop(event, key)}
              sx={{
                p: 2.25,
                position: "relative",
                cursor: "grab",
                textAlign: "left",
                border: "1px solid",
                borderColor: isPriority
                  ? "rgba(212, 175, 55, 0.6)"
                  : "rgba(255,255,255,0.12)",
                background: isPriority
                  ? "linear-gradient(145deg, rgba(212,175,55,0.12), rgba(255,255,255,0.035))"
                  : "rgba(255,255,255,0.035)",
                transition: "border-color 0.2s, transform 0.2s",
                "&:hover": {
                  borderColor: theme.palette.secondary.main,
                  transform: "translateY(-2px)",
                },
                "&:active": { cursor: "grabbing" },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                  mb: 2,
                }}
              >
                <Box>
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                  >
                    <Typography variant="h6" color="common.white">
                      {name}
                    </Typography>
                    <Tooltip title={getHint(key, generalHint)} arrow>
                      <Box
                        component="span"
                        aria-label={`Подсказка: ${name}`}
                        sx={{
                          color: "text.secondary",
                          cursor: "help",
                          fontSize: "0.9rem",
                        }}
                      >
                        ⓘ
                      </Box>
                    </Tooltip>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {shortName}
                  </Typography>
                </Box>
                {isPriority && (
                  <Chip
                    icon={
                      <Box component="span" sx={{ color: "secondary.main" }}>
                        ★
                      </Box>
                    }
                    label={
                      followsRecommendation
                        ? "Рекомендовано"
                        : `Рекомендуется ${recommendedValue}`
                    }
                    color="secondary"
                    variant="outlined"
                    size="small"
                  />
                )}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(90px, 1fr) auto",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Базовое значение
                  </Typography>
                  <TextField
                    type="number"
                    value={baseValue}
                    onChange={(event) =>
                      updateScore(key, Number(event.target.value))
                    }
                    slotProps={{
                      htmlInput: {
                        min: 3,
                        max: 15,
                        step: 1,
                        "aria-label": `Базовое значение: ${name}`,
                      },
                    }}
                    size="small"
                    fullWidth
                    error={!STANDARD_ARRAY.some((item) => item === baseValue)}
                    sx={{ mt: 0.5 }}
                  />
                </Box>
                <Box sx={{ textAlign: "center", minWidth: 88 }}>
                  <Typography variant="caption" color="text.secondary">
                    Итог
                  </Typography>
                  <Typography
                    variant="h4"
                    color="common.white"
                    sx={{ lineHeight: 1.1 }}
                  >
                    {totalValue}
                  </Typography>
                  <Typography color="secondary.main" sx={{ fontWeight: 700 }}>
                    {formatModifier(totalValue)}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  pt: 1.5,
                  borderTop: "1px solid rgba(255,255,255,0.1)",
                  display: "flex",
                  justifyContent: "space-between",
                  color: raceBonus > 0 ? "success.light" : "text.secondary",
                }}
              >
                <Typography variant="body2">
                  Бонус расы «{selectedRace.name}»
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {raceBonus >= 0 ? "+" : ""}
                  {raceBonus}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 1.5 }}
              >
                {getHint(key, generalHint)}
              </Typography>
            </Paper>
          );
        })}
      </Box>

      {!isValid && (
        <Alert severity="warning" sx={{ mt: 2.5, textAlign: "left" }}>
          Используйте каждое значение стандартного массива ровно один раз: 15,
          14, 13, 12, 10 и 8. Расовые бонусы в это ограничение не входят.
        </Alert>
      )}

      <SelectSkills
        selectedClass={selectedClass}
        selectedRace={selectedRace}
        selectedBackground={selectedBackground}
        scores={Object.fromEntries(
          ABILITIES.map(({ key }) => [key, scores[key] + raceBonuses[key]]),
        ) as AbilityScores}
        selectedSkills={selectedSkills}
        onChange={onSkillsChange}
      />
    </Box>
  );
};
