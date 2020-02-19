import React from 'react';
import { Form, Modal, Input, Button } from 'semantic-ui-react';
import { withFormik } from 'formik';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';

import normalizeErrors from '../utils/normalizeErrors';

const ADD_TEAM_MEMBER = gql`
  mutation($email: String!, $teamId: Int!) {
    addTeamMember(email: $email, teamId: $teamId) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

const InvitePeopleModal = ({
  open,
  onClose,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  touched,
  errors
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      closeIcon={true}
      closeOnDimmerClick={true}
    >
      <Modal.Header>Invite New Member</Modal.Header>
      <Modal.Content>
        <Modal.Description>
          <Form>
            <Form.Field>
              <Input
                fluid
                name="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="New member's email..."
              />
              {touched.email && errors.email ? errors.email[0] : null}
            </Form.Field>
            <Form.Field>
              <Form.Group widths="equal">
                <Form.Button
                  fluid
                  type="submit"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  Invite Member
                </Form.Button>
                <Button fluid disabled={isSubmitting} onClick={onClose}>
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
  graphql(ADD_TEAM_MEMBER),
  withFormik({
    mapPropsToValues: () => ({ email: '' }),

    handleSubmit: async (
      values,
      { props: { teamId, onClose, mutate }, setSubmitting, setErrors }
    ) => {
      const response = await mutate({
        variables: { teamId, email: values.email }
      });

      console.log(response);
      const { ok, errors } = response.data.addTeamMember;
      if (ok) {
        onClose();
        setSubmitting(false);
      } else {
        setSubmitting(false);
        setErrors(normalizeErrors(errors));
      }
    }
  })
)(InvitePeopleModal);
