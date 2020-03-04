import React from 'react';
import { withFormik } from 'formik';
import styled from 'styled-components';
import { 
  // Grid, 
  Input, Button, Icon 
} from 'semantic-ui-react';

import FileUpload from './FileUpload';

const FooterWrapper = styled.div`
  grid-column: 3;
  grid-row: 3;
  margin: 20px;
  display: grid;
  grid-template-columns: 50px auto;
`;

const ENTER_KEY = 13;

const Footer = ({
  placeholder,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting,
  channelId
}) => (
  <FooterWrapper>
    <FileUpload channelId={channelId}>
      <Button icon>
        <Icon name="upload" />
      </Button>
    </FileUpload>
    <Input
      fluid
      name="message"
      value={values.message}
      onBlur={handleBlur}
      onChange={handleChange}
      onKeyDown={e => {
        if (e.keyCode === ENTER_KEY && !isSubmitting) {
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
})(Footer);
