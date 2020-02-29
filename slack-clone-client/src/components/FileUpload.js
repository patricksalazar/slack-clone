import React from 'react';
import { useDropzone } from 'react-dropzone';

const FileUpload = ({ children, disableClick }) => {
  const onDrop = () => {
    console.log('file dropped!');
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

export default FileUpload;
