import { Box, Paper, Typography, useTheme } from '@mui/material';
import { BarChart, PieChart, SparkLineChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';
import Slider from 'react-slick';

export default function DashboardCharts({
  times,
}: {
  times: Record<string, any>;
}) {
  const [durations, setDurations] = useState<Record<string, any>>({});
  const { palette } = useTheme();

  useEffect(() => {
    if (Object.keys(times).length === 0) {
      return;
    }

    const totalDurations: Record<string, any> = {};
    Object.keys(times.summary).forEach((key) => {
      totalDurations[key] = {
        duration: times.summary[key].times.reduce(
          (acc: number, curr: Record<string, any>) => acc + curr.duration,
          0
        ),
        displayName: times.summary[key].displayName,
      };
    });
    setDurations(totalDurations);
  }, [times]);

  const sxProps = {
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
    height: 150,
    border: '1px solid',
    borderColor: 'divider',
  };

  return (
    <Slider
      dots
      speed={500}
      infinite
      slidesToShow={4}
      center
      flex={1}
      responsive={[
        {
          breakpoint: 600,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 900,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 3,
            slidesToScroll: 1,
          },
        },
        {
          breakpoint: 1500,
          settings: {
            slidesToShow: 4,
            slidesToScroll: 1,
          },
        },
      ]}
    >
      <Box sx={{ padding: 1 }}>
        <Paper elevation={0} sx={{ ...sxProps }}>
          <BarChart
            borderRadius={4}
            skipAnimation
            xAxis={[
              {
                scaleType: 'band',
                data: [''],
              },
            ]}
            series={[
              {
                label: 'Open',
                data: [times.openCount],
                color: palette.warning.main,
              },
              {
                label: 'Complete',
                data: [times.completeCount],
                color: palette.success.main,
              },
              {
                label: 'Error',
                data: [times.errorCount],
                color: palette.error.main,
              },
              {
                label: 'Total',
                data: [times.totalCount],
                color: palette.info.main,
              },
            ]}
            slotProps={{ legend: { hidden: true } }}
            leftAxis={null}
          />
        </Paper>
      </Box>

      <Box sx={{ padding: 1 }}>
        <Paper elevation={0} sx={{ ...sxProps }}>
          <PieChart
            title="Time Distribution"
            series={[
              {
                data: Object.keys(durations).map((d: string, i: number) => ({
                  id: i,
                  label: durations[d].displayName,
                  value: durations[d].duration,
                })),
              },
            ]}
            slotProps={{ legend: { hidden: true } }}
          />
        </Paper>
      </Box>

      <Box sx={{ padding: 1 }}>
        <Paper elevation={0} sx={{ ...sxProps }}>
          <SparkLineChart
            data={Object.keys(durations).map(
              (d: string) => durations[d].duration
            )}
            curve="natural"
            area
            showHighlight
            showTooltip
          />
        </Paper>
      </Box>

      <Box sx={{ padding: 1 }}>
        <Paper elevation={0} sx={{ ...sxProps }}>
          <BarChart
            borderRadius={4}
            skipAnimation
            xAxis={[
              {
                scaleType: 'band',
                data: [''],
              },
            ]}
            series={Object.keys(durations).map((d: string) => ({
              label: durations[d].displayName,
              data: [durations[d].duration],
            }))}
            slotProps={{ legend: { hidden: true } }}
            leftAxis={null}
          />
        </Paper>
      </Box>
    </Slider>
  );
}
