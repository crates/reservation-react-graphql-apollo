import ApiBuilder from 'claudia-api-builder';
import {graphql} from 'graphql';
import {executableSchema} from './schema';

const api = new ApiBuilder();

api.post('/graphql', request => {
  const {query, operationName, variables} = request.body;
  return graphql(executableSchema, query, null, null, variables, operationName);
});

module.exports = api;
