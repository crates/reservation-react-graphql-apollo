import React from 'react';
import ApolloClient from 'apollo-boost';
import {ApolloProvider} from 'react-apollo';
import {Provider as MobxProvider, observer} from 'mobx-react';
import {decorate, observable} from 'mobx';

import './App.css';
import {ReservationCreator} from './ReservationCreator';
import {ReservationsListContainer} from './ReservationsList';

const client = new ApolloClient({
  uri: 'https://fyuhzcdpwa.execute-api.us-east-1.amazonaws.com/latest/graphql',
});

class Store {
  snackbarOpts = null;

  openSnackbar({duration, message, type}) {
    this.closeSnackbar();
    this.snackbarOpts = {duration, message, type};
    if (duration != null && duration > 0) {
      this.snackbarTimeout = setTimeout(() => {
        this.snackbarOpts = null;
      }, duration);
    }
  }

  closeSnackbar() {
    const {snackbarTimeout} = this;
    if (snackbarTimeout != null) {
      this.snackbarTimeout = null;
      clearTimeout(snackbarTimeout);
    }
    this.snackbarOpts = null;
  }
}

decorate(Store, {
  snackbarOpts: observable,
});

const store = new Store();

export const App = observer(
  class App extends React.Component {
    render() {
      return (
        <MobxProvider store={store}>
          <ApolloProvider client={client}>
            <div className="App">
              <h1 className="c-header">React.js Reservations</h1>

              <ReservationCreator />

              {store.snackbarOpts && (
                <div className="flash">{store.snackbarOpts.message}</div>
              )}

              <ReservationsListContainer />
            </div>
          </ApolloProvider>
        </MobxProvider>
      );
    }
  }
);
