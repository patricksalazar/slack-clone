import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Comment } from 'semantic-ui-react';

import Messages from '../components/Messages';

const QUERY_MESSAGES = gql`
  query($teamId: Int!, $userId: Int!) {
    directMessages(teamId: $teamId, otherUserId: $userId) {
      id
      text
      sender {
        username
      }
      createdAt
    }
  }
`;

const NEW_DIRECT_MESSAGES_SUB = gql`
  subscription($teamId: Int!, $userId: Int!) {
    newDirectMessage(teamId: $teamId, userId: $userId) {
      id
      sender {
        username
      }
      text
      createdAt
    }
  }
`;

class DirectMessageContainer extends React.Component {
  componentDidMount() {
    this.unsubscribe = this.subscribeToMore(
      this.props.teamId,
      this.props.userId
    );
  }

  componentDidUpdate({ teamId, userId }) {
    if (this.props.teamId !== teamId || this.props.userId !== userId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribeToMore(
        this.props.teamId,
        this.props.userId
      );
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribeToMore = (teamId, userId) => {
    return this.props.data.subscribeToMore({
      document: NEW_DIRECT_MESSAGES_SUB,
      variables: {
        teamId,
        userId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          directMessages: [
            ...prev.directMessages,
            subscriptionData.data.newDirectMessage
          ]
        };
      }
    });
  };

  render() {
    const {
      data: { loading, directMessages }
    } = this.props;
    console.log('directMessages: ' + JSON.stringify(directMessages));
    return loading ? null : (
      <Messages>
        <Comment.Group>
          {directMessages.map(m => (
            <Comment key={`direct-message-${m.id}`}>
              <Comment.Content>
                <Comment.Author as="a">{m.sender.username}</Comment.Author>
                <Comment.Metadata>
                  <div>{m.createdAt}</div>
                </Comment.Metadata>
                <Comment.Text>{m.text}</Comment.Text>
                <Comment.Actions>
                  <Comment.Action>Reply</Comment.Action>
                </Comment.Actions>
              </Comment.Content>
            </Comment>
          ))}
        </Comment.Group>
      </Messages>
    );
  }
}

export default graphql(QUERY_MESSAGES, {
  options: props => ({
    variables: {
      teamId: parseInt(props.teamId, 10),
      userId: parseInt(props.userId, 10)
    },
    fetchPolicy: 'network-only'
  })
})(DirectMessageContainer);
