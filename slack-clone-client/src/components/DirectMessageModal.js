import React from 'react';
import { withRouter } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withFormik } from 'formik';
import { findIndex } from 'lodash';
import * as compose from 'lodash.flowright';
import { Form, Header, Modal } from 'semantic-ui-react';

import { ME_QUERY } from '../graphql/team';
import MultiSelectUsers from './MultiSelectUsers';

const CREATE_DM_CHANNEL = gql`
  mutation($teamId: Int!, $members: [Int!]!) {
    createDMChannel(teamId: $teamId, members: $members) {
      ok
      channel {
        id
        name
        dm
      }
    }
  }
`;

const DirectMessageModal = ({
  open,
  onClose,
  teamId,
  currentUserId,
  values,
  handleSubmit,
  isSubmitting,
  resetForm,
  setFieldValue
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeIcon={true}
      closeOnDimmerClick={true}
    >
      <Modal.Header>Add Direct Message</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Header>Search</Header>
          <Form>
            <Form.Field>
              <MultiSelectUsers
                teamId={teamId}
                currentUserId={currentUserId}
                placeholder="select members to message"
                value={values.members}
                handleChange={(e, { value }) => setFieldValue('members', value)}
              />
            </Form.Field>
            <Form.Field>
              <Form.Group widths="equal">
                <Form.Button
                  fluid
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  Start Messaging
                </Form.Button>
                <Form.Button
                  fluid
                  disabled={isSubmitting}
                  onClick={e => {
                    resetForm();
                    onClose(e);
                  }}
                >
                  Cancel
                </Form.Button>
              </Form.Group>
            </Form.Field>
          </Form>
        </Modal.Description>
      </Modal.Content>
    </Modal>
  );
};

export default compose(
  withRouter,
  graphql(CREATE_DM_CHANNEL),
  withFormik({
    mapPropsToValues: () => ({ members: [] }),

    handleSubmit: async (
      { members },
      { props: { teamId, onClose, history, mutate }, resetForm }
    ) => {
      console.log('members: ' + JSON.stringify(members));
      const response = await mutate({
        variables: {
          teamId: parseInt(teamId),
          members: members
        },
        update: (store, { data: { createDMChannel } }) => {
          const { ok, channel } = createDMChannel;
          if (!ok) {
            return;
          }

          const data = store.readQuery({ query: ME_QUERY });
          let teamIdx = findIndex(data.me.teams, ['id', teamId]);
          const notInChannelList = data.me.teams[teamIdx].channels.every(
            c => c.id !== channel.id
          );
          if (notInChannelList) {
            data.me.teams[teamIdx].channels.push({ ...channel });
            store.writeQuery({
              query: ME_QUERY,
              data
            });
          }
          history.push(`/view-team/${teamId}/${channel.id}`);
        }
      });

      console.log(response);
      onClose();
      resetForm();
    },

    displayName: 'BasicForm'
  })
)(DirectMessageModal);
