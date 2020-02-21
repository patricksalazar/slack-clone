import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Comment } from 'semantic-ui-react';

import Messages from '../components/Messages';

const QUERY_MESSAGES = gql`
  query($teamId: Int!, $otherUserId: Int!) {
    directMessages(teamId: $teamId, otherUserId: $$otherUserId) {
      id
      text
      sender {
        username
      }
      createdAt
    }
  }
`;

// const NEW_CHANNEL_MESSAGES_SUB = gql`
//   subscription($channelId: Int!) {
//     newChannelMessage(channelId: $channelId) {
//       id
//       text
//       createdAt
//       user {
//         username
//       }
//     }
//   }
// `;

class MessageContainer extends React.Component {
  // componentDidMount() {
  //   this.unsubscribe = this.subscribeToMore(this.props.channelId);
  // }

  // componentDidUpdate({ channelId }) {
  //   if (this.props.channelId !== channelId) {
  //     if (this.unsubscribe) {
  //       this.unsubscribe();
  //     }
  //     this.unsubscribe = this.subscribeToMore(this.props.channelId);
  //   }
  // }

  // componentWillUnmount() {
  //   if (this.unsubscribe) {
  //     this.unsubscribe();
  //   }
  // }

  // subscribeToMore = channelId => {
  //   return this.props.data.subscribeToMore({
  //     document: NEW_CHANNEL_MESSAGES_SUB,
  //     variables: {
  //       channelId: channelId
  //     },
  //     updateQuery: (prev, { subscriptionData }) => {
  //       console.log('subscriptionData: ' + JSON.stringify(subscriptionData));
  //       if (!subscriptionData) {
  //         return prev;
  //       }

  //       return {
  //         ...prev,
  //         messages: [...prev.messages, subscriptionData.data.newChannelMessage]
  //       };
  //     }
  //   });
  // };

  render() {
    const {
      data: { loading, directMessages },
      channelId
    } = this.props;
    return loading ? null : (
      <Messages channelId={channelId}>
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
  variables: props => ({
    teamId: props.teamId,
    otherUserId: props.otherUserId
  }),
  options: {
    fetchPolicy: 'network-only'
  }
})(DirectMessageContainer);
