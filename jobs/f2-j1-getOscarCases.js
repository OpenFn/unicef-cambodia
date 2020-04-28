// GET new OSCaR cases
// User Story 2: 'View Oscar cases in Primero' AND User Story 4: 'Sending referrals to Primero'
post(
  //Oscar authentication  --> To update?
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  get(
    '/api/v1/organizations/clients?since_date',
    {
      keepCookie: true,
      headers: state => {
        //Oscar authentication
        return {
          'access-token': state.data.__headers['access-token'],
          'Content-Type': 'application/json',
          client: state.data.__headers.client,
          uid: state.configuration.username,
        };
      },
      query: {
        since_date: state.lastQueryDate || '2020-01-01 00:00:00',
      },
    },
    state => {
      const date = new Date(Date.parse(state.data.__headers.date));
      const yyyy = date.getFullYear();
      const mm = date.getMonth();
      const dd = date.getDate();

      state.lastQueryDate = `${yyyy}-${mm}-${dd}`;
      return state;
    }
  )
);
