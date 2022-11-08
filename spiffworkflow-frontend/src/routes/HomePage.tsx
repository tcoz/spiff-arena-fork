import { useEffect, useState } from 'react';
// @ts-ignore
import { Button, Table } from '@carbon/react';
import { Link, useSearchParams } from 'react-router-dom';
import PaginationForTable from '../components/PaginationForTable';
import {
  getPageInfoFromSearchParams,
  modifyProcessModelPath,
} from '../helpers';
import HttpService from '../services/HttpService';
import { PaginationObject, RecentProcessModel } from '../interfaces';

const PER_PAGE_FOR_TASKS_ON_HOME_PAGE = 5;

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState<PaginationObject | null>(null);

  useEffect(() => {
    const { page, perPage } = getPageInfoFromSearchParams(
      searchParams,
      PER_PAGE_FOR_TASKS_ON_HOME_PAGE
    );
    const setTasksFromResult = (result: any) => {
      setTasks(result.results);
      setPagination(result.pagination);
    };
    HttpService.makeCallToBackend({
      path: `/tasks?per_page=${perPage}&page=${page}`,
      successCallback: setTasksFromResult,
    });
  }, [searchParams]);

  let recentProcessModels: RecentProcessModel[] = [];
  const recentProcessModelsString = localStorage.getItem('recentProcessModels');
  if (recentProcessModelsString !== null) {
    recentProcessModels = JSON.parse(recentProcessModelsString);
  }

  const buildTable = () => {
    const rows = tasks.map((row) => {
      const rowToUse = row as any;
      const taskUrl = `/tasks/${rowToUse.process_instance_id}/${rowToUse.id}`;
      const modifiedProcessModelIdentifier = modifyProcessModelPath(
        rowToUse.process_model_identifier
      );
      return (
        <tr key={rowToUse.id}>
          <td>
            <Link
              data-qa="process-model-show-link"
              to={`/admin/process-models/${modifiedProcessModelIdentifier}`}
            >
              {rowToUse.process_model_display_name}
            </Link>
          </td>
          <td>
            <Link
              data-qa="process-instance-show-link"
              to={`/admin/process-models/${modifiedProcessModelIdentifier}/process-instances/${rowToUse.process_instance_id}`}
            >
              View {rowToUse.process_instance_id}
            </Link>
          </td>
          <td
            title={`task id: ${rowToUse.name}, spiffworkflow task guid: ${rowToUse.id}`}
          >
            {rowToUse.title}
          </td>
          <td>{rowToUse.state}</td>
          <td>{rowToUse.process_instance_status}</td>
          <td>
            <Button
              variant="primary"
              href={taskUrl}
              hidden={rowToUse.process_instance_status === 'suspended'}
            >
              Complete Task
            </Button>
          </td>
        </tr>
      );
    });
    return (
      <Table striped bordered>
        <thead>
          <tr>
            <th>Process Model</th>
            <th>Process Instance</th>
            <th>Task Name</th>
            <th>Status</th>
            <th>Process Instance Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    );
  };

  const buildRecentProcessModelSection = () => {
    const rows = recentProcessModels.map((row) => {
      const rowToUse = row as any;
      const modifiedProcessModelId = modifyProcessModelPath(
        rowToUse.processModelIdentifier
      );
      return (
        <tr
          key={`${rowToUse.processGroupIdentifier}/${rowToUse.processModelIdentifier}`}
        >
          <td>
            <Link
              data-qa="process-model-show-link"
              to={`/admin/process-models/${modifiedProcessModelId}`}
            >
              {rowToUse.processModelDisplayName}
            </Link>
          </td>
        </tr>
      );
    });
    return (
      <>
        <h2>Processes I can start</h2>
        <Table striped bordered>
          <thead>
            <tr>
              <th>Process Model</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </>
    );
  };

  const tasksWaitingForMeComponent = () => {
    if (pagination && pagination.total < 1) {
      return null;
    }
    const { page, perPage } = getPageInfoFromSearchParams(
      searchParams,
      PER_PAGE_FOR_TASKS_ON_HOME_PAGE
    );
    return (
      <>
        <h2>Tasks waiting for me</h2>
        <PaginationForTable
          page={page}
          perPage={perPage}
          perPageOptions={[2, PER_PAGE_FOR_TASKS_ON_HOME_PAGE, 25]}
          pagination={pagination}
          tableToDisplay={buildTable()}
          path="/tasks"
        />
      </>
    );
  };

  const relevantProcessModelSection =
    recentProcessModels.length > 0 && buildRecentProcessModelSection();

  if (pagination) {
    return (
      <>
        {tasksWaitingForMeComponent()}
        {relevantProcessModelSection}
      </>
    );
  }
  return null;
}
