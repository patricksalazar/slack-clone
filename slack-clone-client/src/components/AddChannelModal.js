import React from 'react';
import {
  Form,
  Header,
  Modal,
  Input,
  Button,
  Checkbox
} from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import { findIndex } from 'lodash';

import { ME_QUERY } from '../graphql/team';
import MultiSelectUsers from './MultiSelectUsers';

const CREATE_CHANNEL = gql`
  mutation($teamId: Int!, $name: String!, $public: Boolean, $members: [Int!]) {
    createChannel(
      teamId: $teamId
      name: $name
      public: $public
      members: $members
    ) {
      ok
      channel {
        id
        name
      }
    }
  }
`;

const AddChannelModal = ({
  open,
  onClose,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue,
  teamId,
  currentUserId
}) => {
  return (
    <Modal
      open={open}
      onClose={e => {
        resetForm();
        onClose(e);
      }}
      closeIcon={true}
      closeOnDimmerClick={true}
    >
      <Modal.Header>Add Channel</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Search</Header>
          <Form>
            <Form.Field>
              <Input
                fluid
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Channel Name..."
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                checked={!values.public}
                label="Private"
                toggle
                onChange={(e, { checked }) => setFieldValue('public', !checked)}
              />
            </Form.Field>
            {!values.public && (
              <Form.Field>
                <MultiSelectUsers
                  teamId={teamId}
                  currentUserId={currentUserId}
                  placeholder="select members to invite"
                  value={values.members}
                  handleChange={(e, { value }) =>
                    setFieldValue('members', value)
                  }
                />
              </Form.Field>
            )}
            <Form.Field>
              <Form.Group widths="equal">
                <Form.Button
                  fluid
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  Create Channel
                </Form.Button>
                <Button
                  fluid
                  disabled={isSubmitting}
                  onClick={e => {
                    resetForm();
                    onClose(e);
                  }}
                >
                  Cancel
                </Button>
              </Form.Group>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export default compose(
  graphql(CREATE_CHANNEL),
  withFormik({
    mapPropsToValues: () => ({ name: '', public: true, members: [] }),

    handleSubmit: async (
      values,
      { props: { teamId, onClose, mutate }, setSubmitting }
    ) => {
      const response = await mutate({
        variables: {
          teamId: parseInt(teamId),
          name: values.name,
          public: values.public,
          members: values.members
        },
        optimisticResponse: {
          createChannel: {
            __typename: 'Mutation',
            ok: true,
            channel: {
              __typename: 'Channel',
              id: -1,
              name: values.name
            }
          }
        },
        update: (store, { data: { createChannel } }) => {
          const { ok, channel } = createChannel;
          if (!ok) {
            return;
          }

          const data = store.readQuery({ query: ME_QUERY });
          let teamIdx = findIndex(data.me.teams, ['id', teamId]);
          data.me.teams[teamIdx].channels.push(channel);
          store.writeQuery({
            query: ME_QUERY,
            data
          });
        }
      });

      console.log(response);
      onClose();
      setSubmitting(false);
    },

    displayName: 'BasicForm'
  })
)(AddChannelModal);
