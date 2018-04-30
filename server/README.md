# Reservations demo - back-end

* GraphQL Endpoint
* AWS DynamoDB to store reservations
* Simple e2e integration test in ./test/run.js
* Deployed to AWS Lambda / API Gateway via Claudia

## Considerations due to scope of demo

* Does not validate entries
* Does not use native DynamoDB sorting/scanning as DynamoDB was simply a free NoSQL choice
* Does not use date libraries (i.e. moment.js) to format dates

## Running

1.  Create a DynamoDB table
2.  Edit endpoints/configurations as necessary for your AWS account in package.json
3.  `yarn install`
4.  `yarn run create`
5.  `yarn run deploy` for future deployments
6.  `node test/run.js` to run e2e test
