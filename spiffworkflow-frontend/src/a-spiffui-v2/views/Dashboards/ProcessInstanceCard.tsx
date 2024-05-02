import { Divider, Grid, Stack, Typography } from '@mui/material';
import { grey, purple } from '@mui/material/colors';

export default function ProcessInstanceCard({
  instance,
}: {
  instance: Record<string, any>;
}) {
  const fontSize = 12;
  const fontWeight = 600;

  return (
    <Grid
      container
      sx={{
        width: 250,
        border: `2px solid ${purple[200]} `,
        padding: 2,
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Grid item>
        <Stack
          direction="row"
          alignItems="center"
          sx={{
            backgroundColor: grey[300],
            borderRadius: 2,
            padding: 0.75,
            marginBottom: 1,
          }}
        >
          <Typography
            fontWeight={fontWeight}
            fontSize={fontSize + 1}
            sx={{ width: 200 }}
          >
            {instance.process_model_display_name}
          </Typography>
        </Stack>
        <Divider />
        <Stack direction="row" gap={2} alignItems="center">
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            Id:
          </Typography>
          <Typography fontSize={fontSize}>{instance.id}</Typography>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center">
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            Start:
          </Typography>
          <Typography fontSize={fontSize}>
            {instance.start_in_seconds}
          </Typography>
        </Stack>
        <Stack direction="row" gap={2} alignItems="center" paddingBottom={2}>
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            End:
          </Typography>
          <Typography fontSize={fontSize}>{instance.end_in_seconds}</Typography>
        </Stack>
        <Stack>
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            Started by:
          </Typography>
          <Typography fontSize={fontSize} paddingLeft={1}>
            {instance.process_initiator_username}
          </Typography>
        </Stack>
        <Stack>
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            Last milestone:
          </Typography>
          <Typography fontSize={fontSize} paddingLeft={1}>
            {instance.last_milestone_bpmn_name}
          </Typography>
        </Stack>
        <Stack>
          <Typography fontWeight={fontWeight} fontSize={fontSize}>
            Status:
          </Typography>
          <Typography fontSize={fontSize} paddingLeft={1}>
            {instance.status}
          </Typography>
        </Stack>
      </Grid>
    </Grid>
  );
}