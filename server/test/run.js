const API_ID = require('../claudia.json').api.id;
const ENDPOINT = `https://${API_ID}.execute-api.us-east-1.amazonaws.com/latest/reservations-claudia`;

const fetch = require('fetch-ponyfill')().fetch;

async function executeQuery({query, variables}) {
  const res = await fetch(ENDPOINT, {
    body: JSON.stringify({query, variables}),
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  return await res.json();
}

async function testGetReservations() {
  return await executeQuery({
    query: `
      query {
        viewer {
          reservations {
            id
            name
            hotelName
            arrivalDate
            departureDate
          }
        }
      }
    `,
  });
}

async function testGetReservation(id) {
  return await executeQuery({
    query: `
      query ($id: ID!) {
        viewer {
          reservation(id: $id) {
            id
            name
            hotelName
            arrivalDate
            departureDate
          }
        }
      }
    `,
    variables: {
      id,
    },
  });
}

async function testSearchReservations(variables) {
  return await executeQuery({
    query: `
      query ($hotelName: String, $arrivalData: String, $departureDate: String) {
        viewer {
          searchReservations(hotelName: $hotelName, arrivalDate: $arrivalData, departureDate: $departureDate) {
            id
            name
            hotelName
            arrivalDate
            departureDate
          }
        }
      }
    `,
    variables,
  });
}

async function testAddReservation(input) {
  return await executeQuery({
    query: `
      mutation ($input: CreateReservationInput!) {
        createReservation (input: $input) {
          reservation {
            id
            name
            hotelName
            arrivalDate
            departureDate
          }
          success
          errors
        }
      }
    `,
    variables: {
      input,
    },
  });
}

function log(data) {
  console.log('.');
  if (typeof data === 'string') {
    console.log(data);
  } else {
    console.log(JSON.stringify(data));
  }
}

async function main() {
  let result;
  log('------ Get all reservations');
  result = await testGetReservations();
  log(result);

  log('------ Add first reservations');

  result = await testAddReservation({
    name: 'Mary Lamb',
    hotelName: 'The Great Northern Hotel',
    arrivalDate: '2018-04-10',
    departureDate: '2018-04-14',
  });
  log(result);

  log('------ Add second reservations');

  result = await testAddReservation({
    name: 'John Doe',
    hotelName: 'The Taft Hotel',
    arrivalDate: '2018-04-12',
    departureDate: '2018-04-16',
  });
  const reservation_id = result.data.createReservation.reservation.id;
  log(result);

  log('------ Get all reservations');
  result = await testGetReservations();
  log(result);

  log(`------ Get reservation with id ${reservation_id}`);
  result = await testGetReservation(reservation_id);
  log(result);

  log(`------ Search reservation with hotelName: The Great Northern Hotel`);
  result = await testSearchReservations({
    hotelName: 'The Great Northern Hotel',
  });
  log(result);

  log(
    `------ Search reservation with hotelName: The Great Northern Hotel, arrivalDate: 2018-04-10`
  );
  result = await testSearchReservations({
    hotelName: 'The Great Northern Hotel',
    arrivalDate: '2018-04-10',
  });
  log(result);

  log(
    `------ Search reservation with hotelName: The Great Northern Hotel, arrivalDate: 2018-04-10, departureDate: 2019-04-11 (none)`
  );
  result = await testSearchReservations({
    hotelName: 'The Great Northern Hotel',
    arrivalDate: '2018-04-10',
    departureDate: '2019-04-11',
  });
  log(result);
}

main();
