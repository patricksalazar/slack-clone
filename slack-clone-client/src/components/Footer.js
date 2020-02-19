import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { withFormik } from 'formik';
import * as compose from 'lodash.flowright';

import styled from 'styled-components';
import { Input } from 'semantic-ui-react';

const FooterWrapper = styled.div`
  grid-column: 3;
  grid-row: 3;
  margin: 20px;
`;

const ENTER_KEY = 13;

const SEND_MESSAGE = gql`
  mutation($channelId: Int!, $text: String!) {
    createMessage(channelId: $channelId, text: $text)
  }
`;

const SendMessage = ({
  channelName,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting
}) => (
  <FooterWrapper>
    <Input
      fluid
      name="message"
      value={values.message}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={e => {
        if (e.keyCode === ENTER_KEY) {
          handleSubmit();
        }
      }}
      placeholder={`Message #${channelName}`}
    />
  </FooterWrapper>
);

export default compose(
  graphql(SEND_MESSAGE),
  withFormik({
    mapPropsToValues: () => ({ message: '' }),

    handleSubmit: async (
      values,
      { props: { channelId, mutate }, setSubmitting, resetForm }
    ) => {
      if (!values.message || !values.message.trim()) {
        setSubmitting(false);
        return;
      }

      const response = await mutate({
        variables: { channelId: parseInt(channelId), text: values.message }
      });
      console.log('response: ' + response);
      setSubmitting(false);
      resetForm(true);
    },
    displayName: 'BasicForm'
  })
)(SendMessage);
