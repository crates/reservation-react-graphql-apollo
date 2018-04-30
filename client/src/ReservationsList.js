import React from 'react';
import {Query} from 'react-apollo';
import gql from 'graphql-tag';

import './ReservationsList.css';

export const ReservationsListComponent = class ReservationsListComponent extends React.Component {
  render() {
    const {reservations} = this.props;
    return (
      <div className="c-reservations__container">
        {reservations.map(r => (
          <div key={r.id} className="c-reservations__res">
            <div className="c-reservations__name">{r.name}</div>
            <div className="c-reservations__hotel-name">{r.hotelName}</div>
            <div className="c-reservations__dates">
              <span className="c-reservations--nowrap">
                {r.arrivalDate} &mdash;
              </span>{' '}
              {r.departureDate}
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export const ReservationsList_Query = gql`
  query ReservationsList_Query {
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
`;

export const ReservationsListContainer = props => (
  <Query query={ReservationsList_Query}>
    {({loading, error, data}) => {
      if (loading)
        return (
          <div style={{padding: '2em', textAlign: 'center', color: '#fff'}}>
            Loading...
          </div>
        );
      if (error) return `Error! ${error.message}`;

      return (
        <ReservationsListComponent
          {...props}
          reservations={data.viewer.reservations}
        />
      );
    }}
  </Query>
);
