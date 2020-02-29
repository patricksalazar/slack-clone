import React from 'react';
import { withFormik } from 'formik';
import styled from 'styled-components';
import { Grid, Input, Button, Icon } from 'semantic-ui-react';

import FileUpload from './FileUpload';

const FooterWrapper = styled.div`
  grid-column: 3;
  grid-row: 3;
  margin: 20px;
`;

const ENTER_KEY = 13;

const Footer = ({
  placeholder,
  values,
  handleChange,
  handleBlur,
  handleSubmit,
  isSubmitting
}) => (
  <FooterWrapper>
    <Grid>
      <Grid.Row>
        <Grid.Column mobile={1} tablet={1} computer={1}>
          <FileUpload>
            <Button icon>
              <Icon name="upload" />
            </Button>
          </FileUpload>
        </Grid.Column>
        <Grid.Column mobile={15} tablet={16} computer={15} stretched>
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
        </Grid.Column>
      </Grid.Row>
    </Grid>
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
