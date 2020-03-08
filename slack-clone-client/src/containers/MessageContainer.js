import React from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import * as moment from 'moment';
import { Comment } from 'semantic-ui-react';

// import Messages from "../components/Messages";
import FileUpload from '../components/FileUpload';
import RenderText from '../components/RenderText';

const PAGE_SIZE = 10;
const QUERY_MESSAGES = gql`
  query($channelId: Int!, $cursor: String) {
    messages(channelId: $channelId, cursor: $cursor) {
      id
      text
      createdAt
      url
      filetype
      user {
        username
      }
    }
  }
`;

const NEW_CHANNEL_MESSAGES_SUB = gql`
  subscription($channelId: Int!) {
    newChannelMessage(channelId: $channelId) {
      id
      text
      createdAt
      user {
        username
      }
      url
      filetype
    }
  }
`;

const Message = ({ message: { url, text, filetype } }) => {
  if (url) {
    if (filetype.startswith('image/')) {
      return <img src={url} alt="" />;
    } else if (filetype === 'text/plain') {
      return <RenderText url={url} />;
    } else if (filetype.startswith('audio/')) {
      return (
        <div>
          <audio controls>
            <source src={url} type={filetype} />
          </audio>
        </div>
      );
    }
  }

  return <Comment.Text>{text}</Comment.Text>;
};

class MessageContainer extends React.Component {
  state = {
    hasMoreItems: true,
    isHandlingScroll: false
  };

  componentDidMount() {
    this.unsubscribe = this.subscribeToMore(this.props.channelId);
  }

  componentDidUpdate({ data: { messages }, channelId }) {
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribeToMore(this.props.channelId);
    }

    if (
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.props.data.messages
    ) {
      if (messages && this.props.data.messages.length !== messages.length) {
        // 35 items
        const heightBeforeRender = this.scroller.scrollHeight;
        // wait for 70 items to render
        setTimeout(() => {
          this.scroller.scrollTop =
            this.scroller.scrollHeight - heightBeforeRender;
        }, 100);
      }
    }
  }

  componentWillUnmount() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }

  subscribeToMore = channelId => {
    return this.props.data.subscribeToMore({
      document: NEW_CHANNEL_MESSAGES_SUB,
      variables: {
        channelId: channelId
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          messages: [subscriptionData.data.newChannelMessage, ...prev.messages]
        };
      }
    });
  };

  handleScroll = () => {
    const {
      data: { messages, fetchMore },
      channelId
    } = this.props;
    if (
      this.scroller &&
      this.scroller.scrollTop < 100 &&
      this.state.hasMoreItems &&
      messages &&
      messages.length >= PAGE_SIZE &&
      !this.state.isHandlingScroll
    ) {
      this.setState({ isHandlingScroll: true });
      fetchMore({
        variables: {
          channelId,
          cursor: messages[messages.length - 1].createdAt
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }

          if (fetchMoreResult.messages.length < PAGE_SIZE) {
            this.setState({ hasMoreItems: false });
          }

          this.setState({ isHandlingScroll: false });
          return {
            // Append the new feed results to the old one
            ...previousResult,
            messages: [...previousResult.messages, ...fetchMoreResult.messages]
          };
        }
      });
    }
  };
  render() {
    const {
      data: { loading, messages },
      channelId
    } = this.props;
    return loading ? null : (
      <div
        style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: '20px',
          paddingRight: '20px',
          display: 'flex',
          flexDirection: 'column-reverse',
          overflowY: 'auto'
        }}
        onScroll={this.handleScroll}
        ref={scroller => {
          this.scroller = scroller;
        }}
      >
        <FileUpload
          disableClick
          channelId={channelId}
          style={{
            display: 'flex',
            flexDirection: 'column-reverse'
          }}
        >
          <Comment.Group>
            {[...messages].reverse().map(m => (
              <Comment key={`message-${m.id}`}>
                <Comment.Content>
                  <Comment.Author as="a">{m.user.username}</Comment.Author>
                  <Comment.Metadata>
                    <div>
                      {isNaN(m.createdAt)
                        ? moment(m.createdAt).format('llll')
                        : moment.unix(m.createdAt / 1000).format('llll')}
                    </div>
                  </Comment.Metadata>
                  <Message message={m} />
                  <Comment.Actions>
                    <Comment.Action>Reply</Comment.Action>
                  </Comment.Actions>
                </Comment.Content>
              </Comment>
            ))}
          </Comment.Group>
        </FileUpload>
      </div>
    );
  }
}

export default graphql(QUERY_MESSAGES, {
  options: props => ({
    fetchPolicy: 'network-only',
    variables: {
      channelId: props.channelId
    }
  })
})(MessageContainer);
