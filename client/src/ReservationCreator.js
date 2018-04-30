import React from 'react';
import {Mutation} from 'react-apollo';
import gql from 'graphql-tag';

import {observer, inject} from 'mobx-react';
import {decorate, observable} from 'mobx';

import './ReservationCreator.css';
import {ReservationsList_Query} from './ReservationsList';

import {validate} from './validations';

const defaultValues = {
  name: '',
  hotelName: '',
  arrivalDate: '',
  departureDate: '',
};

class _ReservationForm extends React.Component {
  values = {
    ...defaultValues,
  };

  submitting = false;

  valid = false;

  bindFormValue = ({field, type}) => {
    const {values} = this;
    return {
      name: field,
      type,
      value: values[field],
      onChange: async e => {
        values[field] = e.target.value;
        const valid = await validate(values);
        this.valid = valid.success;
      },
    };
  };

  render() {
    const {bindFormValue} = this;
    const {createReservation} = this.props;
    return (
      <div>
        <form
          onSubmit={async e => {
            e.preventDefault();
            this.submitting = true;
            try {
              const input = {...this.values};
              const valid = await validate(input);
              if (valid.success) {
                await createReservation({
                  variables: {
                    input,
                  },
                  optimisticResponse: {
                    __typename: 'Mutation',
                    createReservation: {
                      __typename: 'CreateReservationPayload',
                      reservation: {
                        __typename: 'Reservation',
                        id: 'noop',
                        ...input,
                      },
                      success: true,
                      errors: [],
                    },
                  },
                });
                // console.log({res});
                this.values = {
                  ...defaultValues,
                };
                this.props.store.openSnackbar({
                  duration: 2000,
                  message: `Booked!`,
                });
              } else if (valid.errors && valid.errors.length > 0) {
                alert(valid.errors.join('\n'));
              }
            } catch (err) {
              alert('An error occurred.');
            } finally {
              this.submitting = false;
            }
          }}
        >
          <div className="c-res-form__container">
            <div className="c-res-form__grid">
              <div className="c-res-form__name">
                <input
                  placeholder="Your name"
                  {...bindFormValue({field: 'name', type: 'text'})}
                  className="c-res-form__input"
                />
              </div>
              <div className="c-res-form_hotel-name">
                <select
                  {...bindFormValue({field: 'hotelName', type: 'text'})}
                  className="c-res-form__input"
                >
                  <option disabled value="">
                    Select a hotel...
                  </option>
                  <option value="The Great Northern Hotel">
                    The Great Northern Hotel
                  </option>
                  <option value="The Overlook Hotel">The Overlook Hotel</option>
                  <option value="Royal Imperial Windsor Arms Hotel">
                    Royal Imperial Windsor Arms Hotel
                  </option>
                  <option value="The Taft Hotel">The Taft Hotel</option>
                </select>
              </div>
              <div className="c-res-form__arrival-text">Check-in</div>
              <div className="c-res-form__departure-text">Check-out</div>
              <div className="c-res-form__arrival">
                <input
                  placeholder="Check-in"
                  {...bindFormValue({field: 'arrivalDate', type: 'date'})}
                  className="c-res-form__input"
                  min="2018-04-10"
                  max="2018-05-31"
                />
              </div>
              <div className="c-res-form__departure">
                <input
                  placeholder="Check-out"
                  {...bindFormValue({field: 'departureDate', type: 'date'})}
                  className="c-res-form__input"
                  min="2018-04-10"
                  max="2018-05-31"
                />
              </div>
              <div className="c-res-form__book">
                <button
                  type="submit"
                  disabled={this.submitting}
                  className={[
                    'c-res-form__button',
                    this.valid ? null : 'c-res-form__button--invalid',
                  ]
                    .filter(x => x)
                    .join(' ')}
                >
                  Book
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

decorate(_ReservationForm, {
  values: observable,
  submitting: observable,
  valid: observable,
});

export const CreateReservation_Mutation = gql`
  mutation($input: CreateReservationInput!) {
    createReservation(input: $input) {
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
`;

const CreateReservation_onUpdate = (cache, {data: {createReservation}}) => {
  if (createReservation.success) {
    let {viewer} = cache.readQuery({query: ReservationsList_Query});
    let {reservations} = viewer;
    reservations = [createReservation.reservation, ...reservations];
    viewer = {
      ...viewer,
      reservations,
    };
    cache.writeQuery({
      query: ReservationsList_Query,
      data: {viewer},
    });
  }
};

export const ReservationForm = inject('store')(observer(_ReservationForm));

export const ReservationCreator = props => (
  <Mutation
    mutation={CreateReservation_Mutation}
    update={CreateReservation_onUpdate}
  >
    {createReservation => (
      <ReservationForm {...props} createReservation={createReservation} />
    )}
  </Mutation>
);
