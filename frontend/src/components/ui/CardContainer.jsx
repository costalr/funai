import { Card, CardContent, Typography, IconButton, Box } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

export default function CardContainer({
  titulo,
  valor,
  subtitulo,
  onIconClick,
  exibirIcone = true,
}) {
  return (
    <Card
      sx={{
        width: "100%",
        minHeight: 130,
        boxShadow: 2,
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="subtitle2" color="text.secondary">
            {titulo}
          </Typography>
          {exibirIcone && (
            <IconButton size="small" onClick={onIconClick}>
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Typography
          variant="h4"
          component="div"
          sx={{ color: "green", fontWeight: "bold", mt: 1 }}
        >
          {valor}
        </Typography>

        {subtitulo && (
          <Typography variant="caption" color="text.secondary">
            {subtitulo}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
