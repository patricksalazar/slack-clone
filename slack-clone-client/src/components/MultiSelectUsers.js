import React from 'react';
import { graphql } from 'react-apollo';
import { Dropdown } from 'semantic-ui-react';

import {GET_TEAM_MEMBERS} from '../graphql/team';

const MultiSelectUsers = ({
  data: { loading, getTeamMembers },
  value,
  handleChange,
  placeholder,
}) => loading ? null : (
  <Dropdown placeholder={placeholder} fluid multiple search selection 
    value={value}
    onChange={handleChange}
    options={getTeamMembers.map(tm => ({
      key: tm.id,
      value: tm.id,
      text: tm.username
    }))} />
)

export default graphql(GET_TEAM_MEMBERS, {
  options: ({teamId}) => ({ variables: { teamId }})
})(MultiSelectUsers);
