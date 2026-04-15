import React from "react";
import {
  Box,
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Button,
  Stack,
  Divider,
} from "@mui/material";
// Use alternative icon names to avoid export resolution issues in some icon package versions
import ErrorIcon from "@mui/icons-material/Error";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";
import InfoIcon from "@mui/icons-material/Info";

const severityMeta = (sev) => {
  const s = (sev || "").toString().toLowerCase();
  if (s.includes("crit") || s.includes("error"))
    return {
      label: "Critical",
      color: "error",
      Icon: ErrorIcon,
      bg: "linear-gradient(135deg,#ef4444,#fb7185)",
    };
  if (s.includes("warn"))
    return {
      label: "Warning",
      color: "warning",
      Icon: ReportProblemIcon,
      bg: "linear-gradient(135deg,#f59e0b,#fb923c)",
    };
  return {
    label: "Info",
    color: "info",
    Icon: InfoIcon,
    bg: "linear-gradient(135deg,#10b981,#06b6d4)",
  };
};

const Alerts = ({ alerts = [] }) => {
  if (!alerts || alerts.length === 0) {
    return (
      <Card elevation={2} sx={{ borderRadius: 2, p: 2 }}>
        <CardContent>
          <Typography variant="h6">Alerts</Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            No active alerts
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Stack spacing={2}>
      {alerts.map((alert, idx) => {
        const meta = severityMeta(alert.severity);
        const ids = Array.isArray(alert.rfis) ? alert.rfis : [];
        const shown = ids.slice(0, 6);
        const more = Math.max(0, ids.length - shown.length);

        return (
          <Card
            key={idx}
            elevation={3}
            sx={{
              borderRadius: 2,
              overflow: "visible",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              p: { xs: 1, sm: 2 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minWidth: 0,
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "transparent",
                  width: 56,
                  height: 56,
                  boxShadow: "0 8px 20px rgba(2,6,23,0.08)",
                  backgroundImage: meta.bg,
                }}
              >
                <meta.Icon sx={{ color: "#fff" }} />
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {alert.message}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  RFIs: {shown.join(", ")}
                  {more ? ` +${more} more` : ""}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip label={meta.label} color={meta.color} size="small" />
              {alert.action && (
                <Button variant="outlined" size="small" sx={{ ml: 1 }}>
                  {alert.action}
                </Button>
              )}

              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  mx: 1,
                  display: { xs: "none", sm: "block" },
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  minWidth: 36,
                  textAlign: "right",
                }}
              >
                {ids.length}
              </Typography>
            </Box>
          </Card>
        );
      })}
    </Stack>
  );
};

export default Alerts;