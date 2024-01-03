import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @ts-ignore
import {
  Button,
  Form,
  Stack,
  TextInput,
  TextArea,
  Table,
  TableHead,
  TableRow,
  TableHeader,
} from '@carbon/react';
import { Edit, TrashCan, Add } from '@carbon/icons-react';
import { modifyProcessIdentifierForPathParam, slugifyString } from '../helpers';
import HttpService from '../services/HttpService';
import {
  CorrelationKey,
  CorrelationProperty,
  Message,
  ProcessGroup,
  RetrievalExpression,
} from '../interfaces';
import ButtonWithConfirmation from './ButtonWithConfirmation';
import MessageModal from './messages/MessageModal';

import useProcessGroupFetcher from '../hooks/useProcessGroupFetcher';

type OwnProps = {
  mode: string;
  processGroup: ProcessGroup;
  setProcessGroup: (..._args: any[]) => any;
};

export default function ProcessGroupForm({
  mode,
  processGroup,
  setProcessGroup,
}: OwnProps) {
  const [identifierInvalid, setIdentifierInvalid] = useState<boolean>(false);
  const [idHasBeenUpdatedByUser, setIdHasBeenUpdatedByUser] =
    useState<boolean>(false);
  const [displayNameInvalid, setDisplayNameInvalid] = useState<boolean>(false);
  const navigate = useNavigate();
  let newProcessGroupId = processGroup.id;

  const { updateProcessGroupCache } = useProcessGroupFetcher(processGroup.id);

  const handleProcessGroupUpdateResponse = (_result: any) => {
    if (newProcessGroupId) {
      updateProcessGroupCache(processGroup);
      navigate(
        `/process-groups/${modifyProcessIdentifierForPathParam(
          newProcessGroupId
        )}`
      );
    }
  };

  const hasValidIdentifier = (identifierToCheck: string) => {
    return identifierToCheck.match(/^[a-z0-9][0-9a-z-]*[a-z0-9]$/);
  };

  const handleFormSubmission = (event: any) => {
    const searchParams = new URLSearchParams(document.location.search);
    const parentGroupId = searchParams.get('parentGroupId');

    event.preventDefault();
    let hasErrors = false;
    if (mode === 'new' && !hasValidIdentifier(processGroup.id)) {
      setIdentifierInvalid(true);
      hasErrors = true;
    }
    if (processGroup.display_name === '') {
      setDisplayNameInvalid(true);
      hasErrors = true;
    }
    if (hasErrors) {
      return;
    }
    let path = '/process-groups';
    if (mode === 'edit') {
      path = `/process-groups/${modifyProcessIdentifierForPathParam(
        processGroup.id
      )}`;
    }
    let httpMethod = 'POST';
    if (mode === 'edit') {
      httpMethod = 'PUT';
    }
    const postBody = {
      display_name: processGroup.display_name,
      description: processGroup.description,
      messages: processGroup.messages,
      correlation_keys: processGroup.correlation_keys,
      correlation_properties: processGroup.correlation_properties,
    };
    if (mode === 'new') {
      if (parentGroupId) {
        newProcessGroupId = `${parentGroupId}/${processGroup.id}`;
      }
      Object.assign(postBody, {
        id: parentGroupId
          ? `${parentGroupId}/${processGroup.id}`
          : `${processGroup.id}`,
      });
    }

    HttpService.makeCallToBackend({
      path,
      successCallback: handleProcessGroupUpdateResponse,
      httpMethod,
      postBody,
    });
  };

  const updateProcessGroup = (newValues: any) => {
    const processGroupToCopy = {
      ...processGroup,
    };
    Object.assign(processGroupToCopy, newValues);
    setProcessGroup(processGroupToCopy);
  };

  const onDisplayNameChanged = (newDisplayName: any) => {
    setDisplayNameInvalid(false);
    const updateDict = { display_name: newDisplayName };
    if (!idHasBeenUpdatedByUser && mode === 'new') {
      Object.assign(updateDict, { id: slugifyString(newDisplayName) });
    }
    updateProcessGroup(updateDict);
  };

  const onDeleteMessage = (messageToDelete: Message) => {
    // Remove message from process group
    const newMessages = processGroup.messages?.filter((msg: Message) => {
      return msg.id !== messageToDelete.id;
    });

    // Remove retrieval expressions from correlation properties related to message
    const newCorrelationProperties: CorrelationProperty[] = JSON.parse(
      JSON.stringify(processGroup.correlation_properties || [])
    );
    newCorrelationProperties.forEach((cp: CorrelationProperty) => {
      // eslint-disable-next-line no-param-reassign
      cp.retrieval_expressions = cp.retrieval_expressions.filter(
        (re: RetrievalExpression) => {
          return re.message_ref !== messageToDelete.id;
        }
      );
    });
    updateProcessGroup({
      messages: newMessages,
      correlation_properties: newCorrelationProperties,
    });
  };

  const formElements = () => {
    const textInputs = [
      <TextInput
        id="process-group-display-name"
        data-qa="process-group-display-name-input"
        name="display_name"
        invalidText="Display Name is required."
        invalid={displayNameInvalid}
        labelText="Display Name*"
        value={processGroup.display_name}
        onChange={(event: any) => onDisplayNameChanged(event.target.value)}
      />,
    ];

    if (mode === 'new') {
      textInputs.push(
        <TextInput
          id="process-group-identifier"
          name="id"
          invalidText="Identifier is required and must be all lowercase characters and hyphens."
          invalid={identifierInvalid}
          labelText="Identifier*"
          value={processGroup.id}
          onChange={(event: any) => {
            updateProcessGroup({ id: event.target.value });
            // was invalid, and now valid
            if (identifierInvalid && hasValidIdentifier(event.target.value)) {
              setIdentifierInvalid(false);
            }
            setIdHasBeenUpdatedByUser(true);
          }}
        />
      );
    }

    textInputs.push(
      <TextArea
        id="process-group-description"
        name="description"
        labelText="Description"
        value={processGroup.description}
        onChange={(event: any) =>
          updateProcessGroup({ description: event.target.value })
        }
      />
    );
    return textInputs;
  };

  const [messageModelForModal, setMessageModelForModal] =
    useState<Message | null>(null);
  const [correlationKeyForModal, setCorrelationKeyForMessageModal] = useState<
    CorrelationKey | undefined
  >(undefined);

  const messageEditModal = () => {
    console.log('Message Model for Modal', messageModelForModal);
    if (messageModelForModal) {
      return (
        <MessageModal
          messageModel={messageModelForModal}
          open={!!messageModelForModal}
          correlationKey={correlationKeyForModal}
          processGroup={processGroup}
          onClose={() => {
            setMessageModelForModal(null);
            setCorrelationKeyForMessageModal(undefined);
          }}
          onSave={(updatedProcessGroup) => {
            setMessageModelForModal(null);
            setCorrelationKeyForMessageModal(undefined);
            setProcessGroup(updatedProcessGroup);
          }}
        />
      );
    }
    return null;
  };

  const getPropertiesForMessage = (message: Message) => {
    const properties: CorrelationProperty[] = [];
    if (processGroup.correlation_properties) {
      processGroup.correlation_properties.forEach((cp: CorrelationProperty) => {
        cp.retrieval_expressions.forEach((re: RetrievalExpression) => {
          if (re.message_ref === message.id) {
            properties.push(cp);
          }
        });
      });
    }
    return properties;
  };

  const arrayCompare = (array1: string[], array2: string[]) => {
    return (
      array1.length === array2.length &&
      array1.every((value, index) => value === array2[index])
    );
  };

  const findMessagesForCorrelationKey = (
    correlationKey?: CorrelationKey
  ): Message[] => {
    const messages: Message[] = [];
    if (processGroup.messages) {
      processGroup.messages.forEach((msg: Message) => {
        const correlationProperties = getPropertiesForMessage(msg);
        const propIds: string[] = correlationProperties.map(
          (cp: CorrelationProperty) => {
            return cp.id;
          }
        );
        propIds.sort();
        if (correlationKey) {
          if (
            arrayCompare(propIds, correlationKey.correlation_properties.sort())
          ) {
            messages.push(msg);
          }
        } else if (propIds.length === 0) {
          messages.push(msg);
        }
      });
    }
    return messages;
  };

  const messageDisplay = (correlationKey?: CorrelationKey) => {
    let body = <p>No messages defined.</p>;
    const messages = findMessagesForCorrelationKey(correlationKey);
    const items: any[] = messages.map((msg: Message) => {
      return (
        <TableRow>
          <td>{msg.id}</td>
          <td>&nbsp</td>
          <td>&nbsp</td>
          <td>&nbsp</td>
          <td>
            <Button
              kind="ghost"
              data-qa="edit-message-button"
              renderIcon={Edit}
              iconDescription="Edit Message"
              hasIconOnly
              onClick={() => {
                setMessageModelForModal(msg);
                setCorrelationKeyForMessageModal(correlationKey);
              }}
            >
              Edit process group
            </Button>
            <ButtonWithConfirmation
              kind="ghost"
              data-qa="delete-message-button"
              renderIcon={TrashCan}
              iconDescription="Delete Message"
              hasIconOnly
              description={`Delete message: ${msg.id}`}
              onConfirmation={() => {
                onDeleteMessage(msg);
              }}
              confirmButtonLabel="Delete"
            />
          </td>
        </TableRow>
      );
    });
    if (items.length > 0) {
      body = (
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Sending</TableHeader>
              <TableHeader>Receiving</TableHeader>
              <TableHeader>Api</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
            {items}
          </TableHead>
        </Table>
      );
    }
    return <div className="processGroupMessages">{body}</div>;
  };

  const messageSection = () => {
    let items: any[] = [];
    if (
      processGroup.correlation_keys &&
      processGroup.correlation_keys.length > 0
    ) {
      // @ts-ignore
      const keys = [undefined].concat(processGroup.correlation_keys);
      items = keys.map((ck: CorrelationKey | undefined) => {
        const id = ck?.id || 'uncorrelated';
        const dataQA = `add-message-button-${id}`;
        return (
          <>
            <br />
            <br />
            <h3>
              <b>{id}</b> Messages
              <Button
                kind="ghost"
                data-qa={dataQA}
                renderIcon={Add}
                iconDescription="Add Message"
                hasIconOnly
                onClick={() => {
                  setMessageModelForModal({ id: '' });
                  setCorrelationKeyForMessageModal(ck);
                }}
              >
                Edit process group
              </Button>
            </h3>

            {messageDisplay(ck)}
          </>
        );
      });
    }
    return (
      <div className="processGroupMessages">
        {messageEditModal()}
        <h2>Messages</h2>
        {items}
        <Button
          kind="ghost"
          data-qa="add-correlation-button"
          renderIcon={Add}
          iconDescription="Add Correlation"
          hasIconOnly
        >
          Edit process group
        </Button>
      </div>
    );
  };

  const formButtons = () => {
    return <Button type="submit">Submit</Button>;
  };

  return (
    <Form onSubmit={handleFormSubmission}>
      <Stack gap={5}>
        {formElements()}
        {messageSection()}
        {formButtons()}
      </Stack>
    </Form>
  );
}
