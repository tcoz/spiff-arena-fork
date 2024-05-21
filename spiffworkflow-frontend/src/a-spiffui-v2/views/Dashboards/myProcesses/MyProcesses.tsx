import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import ProcessInstanceCard from '../cards/ProcessInstanceCard';

export default function MyProcesses({
  filter,
  callback,
  pis,
}: {
  filter: string;
  callback: (data: Record<string, any>) => void;
  pis: Record<string, any>;
}) {
  // TODO: Type of this doesn't seem to be ProcessInstance
  // Find out and remove "any""
  const [processInstanceColumns, setProcessInstanceColumns] = useState<
    GridColDef[]
  >([]);
  const [processInstanceRows, setProcessInstanceRows] = useState<
    GridRowsProp[]
  >([]);

  const handleGridRowClick = (data: Record<string, any>) => {
    callback(data.row);
  };

  useEffect(() => {
    const filtered =
      filter && pis.results
        ? pis.results.filter((instance: any) => {
            console.log(pis.results);
            const searchFields = [
              'process_model_display_name',
              'last_milestone_bpmn_name',
              'process_initiator_username',
              'status',
            ];

            return searchFields.some((field) =>
              (instance[field] || '')
                .toString()
                .toLowerCase()
                .includes(filter.toLowerCase())
            );
          })
        : pis.results || [];

    setProcessInstanceRows(filtered);
  }, [filter]);

  useEffect(() => {
    if ('report_metadata' in pis) {
      const columns = [
        {
          field: 'process_instances',
          headerName: 'Process Instances',
          flex: 1,
          renderCell: (params: Record<string, any>) => (
            <ProcessInstanceCard pi={params} />
          ),
        },
      ];
      const rows = [...pis.results];
      setProcessInstanceColumns(columns);
      setProcessInstanceRows(rows);
    }
  }, [pis]);

  return (
    <DataGrid
      autoHeight
      columnHeaderHeight={0}
      getRowHeight={() => 'auto'}
      rows={processInstanceRows}
      columns={processInstanceColumns}
      onRowClick={handleGridRowClick}
    />
  );
}
