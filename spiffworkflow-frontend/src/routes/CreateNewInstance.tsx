import { useEffect } from 'react';
import ProcessModelListTiles from '../components/ProcessModelListTiles';
import { PRODUCT_NAME } from '../config';

export default function CreateNewInstance() {
  useEffect(() => {
    document.title = `Start new instance - ${PRODUCT_NAME}`;
  }, []);

  return (
    <ProcessModelListTiles
      headerElement={<h2>Processes I can start</h2>}
      checkPermissions={false}
    />
  );
}
