import React from 'react';
import { Grid } from 'semantic-ui-react';

import TeamSidebar from '../components/teams/TeamSidebar';

export default () => (
  <Grid stretched>
    <Grid.Row stretched>
      <Grid.Column width="12">
        <TeamSidebar
          teamName="Bob is Cool"
          username="Bob thefirst"
          channelNames={['General', 'random']}
          privateChannels={['slackbot', 'Bob the first', 'Bob the second']}
        />
      </Grid.Column>
    </Grid.Row>
  </Grid>
);
