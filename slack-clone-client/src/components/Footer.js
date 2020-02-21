import React from 'react';
import { withFormik } from 'formik';

import styled from 'styled-components';
import { Input } from 'semantic-ui-react';

const FooterWrapper = styled.div`
  grid-column: 3;
  grid-row: 3;
  margin: 20px;
`;

const ENTER_KEY = 13;

const SendMessage = ({
  placeholder,
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
      placeholder={`Message #${placeholder}`}
    />
  </FooterWrapper>
);

export default withFormik({
  mapPropsToValues: () => ({ message: '' }),

  handleSubmit: async (
    values,
    { props: { onSubmit }, setSubmitting, resetForm }
  ) => {
    if (!values.message || !values.message.trim()) {
      setSubmitting(false);
      return;
    }

    await onSubmit(values.message);

    setSubmitting(false);
    resetForm(true);
  },
  displayName: 'BasicForm'
})(SendMessage);
