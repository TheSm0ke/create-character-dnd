import { Box, Chip, Divider, Typography } from "@mui/material";

interface ClassHeadingProps {
  title: string;
  subtitle?: string;
  description?: string;
  isSpellcaster?: boolean;
  isMobile?: boolean;
}

export const ClassHeading = ({
  title,
  subtitle,
  description,
  isSpellcaster = false,
  isMobile = false,
}: ClassHeadingProps) => (
  <Box sx={{ mb: 1.5 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box>
        <Typography
          variant={isMobile ? "h6" : "h5"}
          sx={{
            color: "common.white",
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      {isSpellcaster && (
        <Chip label="Заклинатель" color="primary" size="small" variant="outlined" />
      )}
    </Box>
    {description && (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
        {description}
      </Typography>
    )}
    <Divider sx={{ borderColor: "divider", mt: 1.5 }} />
  </Box>
);
