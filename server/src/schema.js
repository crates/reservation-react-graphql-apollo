import AWS from 'aws-sdk';
import {makeExecutableSchema} from 'graphql-tools';
import uuid from 'node-uuid';

const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = 'reservations-react';
const AttributesToGet = [
  'id',
  'name',
  'hotelName',
  'arrivalDate',
  'departureDate',
  'createdAt',
];

const typeDefs = [
  `
schema {
  query: Query
  mutation: Mutation
}

type Query {
	viewer: Viewer!
}

type Viewer {
  reservation(id: ID!): Reservation!
  reservations: [Reservation!]!
  searchReservations(hotelName: String, arrivalDate: String, departureDate: String): [Reservation!]!
}

type Reservation {
	id: ID!
	name: String!
	hotelName: String!
	arrivalDate: String!
	departureDate: String!
}

type Mutation {
  createReservation(input: CreateReservationInput!): CreateReservationPayload
}

input CreateReservationInput {
	name: String!
	hotelName: String!
	arrivalDate: String!
	departureDate: String!
}

type CreateReservationPayload {
  reservation: Reservation
  success: Boolean!
  errors: [String]
}

`,
];

const resolvers = {
  Query: {
    viewer() {
      return {};
    },
  },
  Viewer: {
    async reservation(root, {id}) {
      const result = await docClient
        .get({
          Key: {id},
          TableName,
          AttributesToGet,
        })
        .promise();

      return result.Item;
    },
    async reservations() {
      const result = await docClient
        .scan({
          TableName,
          AttributesToGet,
        })
        .promise();
      const reservations = result.Items.sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      return reservations;
    },
    async searchReservations(root, {hotelName, arrivalDate, departureDate}) {
      // @fixme
      const result = await docClient
        .scan({
          TableName,
          AttributesToGet,
        })
        .promise();

      const reservations = result.Items.sort(
        (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
      );

      const filtered = reservations.filter(r => {
        if (hotelName != null) {
          if (hotelName !== r.hotelName) return false;
        }
        if (arrivalDate != null) {
          if (arrivalDate !== r.arrivalDate) return false;
        }
        if (departureDate != null) {
          if (departureDate !== r.departureDate) return false;
        }
        return true;
      });

      return filtered;
    },
  },
  Mutation: {
    async createReservation(
      root,
      {input: {name, hotelName, arrivalDate, departureDate}}
    ) {
      const reservation = {
        id: uuid.v4(),
        name,
        hotelName,
        arrivalDate,
        departureDate,
        createdAt: Date.now(),
      };

      await docClient
        .put({
          TableName,
          Item: reservation,
        })
        .promise();

      return {
        reservation,
        success: true,
        errors: [],
      };
    },
  },
};

export const executableSchema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
