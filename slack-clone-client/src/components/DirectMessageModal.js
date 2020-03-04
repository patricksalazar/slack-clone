import React from 'react';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import Downshift from 'downshift';
import { Form, Header, Modal, Input, Button } from 'semantic-ui-react';

import {GET_TEAM_MEMBERS} from '../graphql/team';

const DirectMessageModal = ({
  history,
  open,
  onClose,
  teamId,
  data: { loading, getTeamMembers }
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
              {!loading && (
                <Downshift
                  onChange={selectedUser => {
                    history.push(
                      `/view-team/user/${teamId}/${selectedUser.id}`
                    );
                    onClose();
                    return false;
                  }}
                  itemToString={item => (item ? item.value : '')}
                >
                  {({
                    getInputProps,
                    getItemProps,
                    // getLabelProps,
                    getMenuProps,
                    isOpen,
                    inputValue,
                    highlightedIndex,
                    selectedItem
                    // getRootProps
                  }) => (
                    <div>
                      <Input
                        {...getInputProps({
                          placeholder: 'Select a username...'
                        })}
                        fluid
                      />
                      <ul {...getMenuProps()}>
                        {isOpen
                          ? getTeamMembers
                              .filter(
                                item =>
                                  !inputValue ||
                                  item.username
                                    .toLowerCase()
                                    .includes(inputValue.toLowerCase())
                              )
                              .map((item, index) => (
                                <li
                                  {...getItemProps({
                                    key: item.id,
                                    index,
                                    item: item,
                                    style: {
                                      backgroundColor:
                                        highlightedIndex === index
                                          ? 'lightgray'
                                          : 'white',
                                      fontWeight:
                                        selectedItem === item
                                          ? 'bold'
                                          : 'normal'
                                    }
                                  })}
                                >
                                  {item.username}
                                </li>
                              ))
                          : null}
                      </ul>
                    </div>
                  )}
                </Downshift>
              )}
            </Form.Field>
            <Form.Field>
              <Form.Group widths="equal">
                <Form.Button fluid type="submit">
                  Add User
                </Form.Button>
                <Button fluid onClick={onClose}>
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

export default withRouter(graphql(GET_TEAM_MEMBERS)(DirectMessageModal));
