import { Box, Chip, Stack, useTheme } from '@mui/material';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import useTaskCollection from '../../../hooks/useTaskCollection';

export default function MyTasks({
  filter,
  callback,
  tasks,
}: {
  filter: string;
  callback: (data: Record<string, any>) => void;
  tasks: Record<string, any>;
}) {
  const [taskColumns, setTaskColumns] = useState<GridColDef[]>([]);
  const [taskRows, setTaskRows] = useState<GridRowsProp[]>([]);

  /** These values map to theme tokens, which enable the light/dark modes etc. */
  const chipBackground = (row: any) => {
    return `${row.task_status}`.toLowerCase() === 'ready'
      ? `success.${useTheme().palette.mode}`
      : 'default';
  };

  const handleGridRowClick = (data: Record<string, any>) => {
    callback(data.row);
  };

  const columnData: Record<string, any> = [
    { header: 'Title', field: 'task_title' },
    { header: 'Process ID', field: 'process_instance_id' },
    { header: 'Type', field: 'task_type' },
    { header: 'Status', field: 'task_status' },
    { header: 'Process', field: 'process_model_display_name' },
    { header: 'Initiator', field: 'process_initiator_username' },
    { header: 'ProcessStatus', field: 'process_instance_status' },
  ];

  useEffect(() => {
    const filtered =
      filter && tasks.results
        ? tasks.results.filter((instance: any) => {
            return columnData.some((data: Record<string, any>) =>
              (instance[data.field] || '')
                .toString()
                .toLowerCase()
                .includes(filter.toLowerCase())
            );
          })
        : tasks.results || [];

    setTaskRows(filtered);
  }, [filter]);

  useEffect(() => {
    if ('results' in tasks) {
      const mappedColumns = columnData.map((column: Record<string, any>) => {
        return {
          field: column.field,
          headerName: column.header,
          flex: (() => {
            if (column.header === 'Type' || column.header === 'Process ID') {
              return 0.5;
            }
            return 1;
          })(),
          renderCell:
            column.header === 'Status'
              ? (params: Record<string, any>) => (
                  <Chip
                    label={params.row.task_status || '...no info...'}
                    variant="filled"
                    sx={{
                      width: '100%',
                      backgroundColor: chipBackground(params.row),
                    }}
                  />
                )
              : null,
        };
      });

      setTaskColumns(mappedColumns);
      setTaskRows([...tasks.results]);
    }
  }, [tasks]);

  return (
    <>
      <Box
        sx={{
          display: { xs: 'none', lg: 'block' },
          position: 'relative',
          overflowY: 'auto',
          height: 'calc(100vh - 420px)',
        }}
      >
        <DataGrid
          sx={{
            '&, [class^=MuiDataGrid]': { border: 'none' },
          }}
          rows={taskRows}
          columns={taskColumns}
          onRowClick={handleGridRowClick}
        />
      </Box>
      <Box
        sx={{
          display: { xs: 'block', lg: 'none' },
        }}
      >
        <Stack
          gap={2}
          sx={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {taskRows.map((instance: Record<string, any>) => (
            <>Hello</> // <ProcessInstanceCard instance={instance} />
          ))}
        </Stack>
      </Box>
    </>
  );
}