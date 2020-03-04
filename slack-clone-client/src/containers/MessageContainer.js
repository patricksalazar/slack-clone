import React from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import { Comment } from "semantic-ui-react";

// import Messages from "../components/Messages";
import FileUpload from "../components/FileUpload";
import RenderText from "../components/RenderText";

const QUERY_MESSAGES = gql`
  query($channelId: Int!) {
    messages(channelId: $channelId) {
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
    }
  }
`;

const Message = ({message: {url, text, filetype} }) => {
  if (url) {
    if (filetype.startswith('image/')) {
      return (<img src={url} alt=""/>)
    }else if (filetype === 'text/plain') {
      return (<RenderText url={url} />);
    }else if (filetype.startswith('audio/')) {
      return (
        <div>
          <audio controls>
            <source src={url} type={filetype} />
          </audio>
        </div>
      );
    }
  }

  return (
    <Comment.Text>{text}</Comment.Text>
  );
}

class MessageContainer extends React.Component {
  componentDidMount() {
    this.unsubscribe = this.subscribeToMore(this.props.channelId);
  }

  componentDidUpdate({ channelId }) {
    if (this.props.channelId !== channelId) {
      if (this.unsubscribe) {
        this.unsubscribe();
      }
      this.unsubscribe = this.subscribeToMore(this.props.channelId);
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
        console.log("subscriptionData: " + JSON.stringify(subscriptionData));
        if (!subscriptionData) {
          return prev;
        }

        return {
          ...prev,
          messages: [...prev.messages, subscriptionData.data.newChannelMessage]
        };
      }
    });
  };

  render() {
    const {
      data: { loading, messages },
      channelId
    } = this.props;
    return loading ? null : (
      <FileUpload
        disableClick
        channelId={channelId}
        style={{
          gridColumn: 3,
          gridRow: 2,
          paddingLeft: "20px",
          paddingRight: "20px",
          display: "flex",
          flexDirection: "column-reverse",
          overflowY: "auto"
        }}
      >
        <Comment.Group>
          {messages.map(m => (
            <Comment key={`message-${m.id}`}>
              <Comment.Content>
                <Comment.Author as="a">{m.user.username}</Comment.Author>
                <Comment.Metadata>
                  <div>{m.createdAt}</div>
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
    );
  }
}

export default graphql(QUERY_MESSAGES, {
  variables: props => ({
    channelId: props.channelId
  }),
  options: {
    fetchPolicy: "network-only"
  }
})(MessageContainer);
