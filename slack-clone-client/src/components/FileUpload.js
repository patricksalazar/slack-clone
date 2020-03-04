import React from 'react';
import { graphql } from 'react-apollo';
import { useDropzone } from 'react-dropzone';
import gql from 'graphql-tag';

const CREATE_FILE_MESSAGE = gql`
  mutation($channelId: Int!, $file: File) {
    createMessage(channelId: $channelId, file: $file)
  }
`;

const FileUpload = ({ children, disableClick, channelId, mutate }) => {
  const onDrop = async ([file]) => {
    const response = await mutate({variables: {
      channelId,
      file,
    }})
    console.log(response);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    noClick: disableClick
  });
  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {children}
    </div>
  );
};

export default graphql(CREATE_FILE_MESSAGE)(FileUpload);
