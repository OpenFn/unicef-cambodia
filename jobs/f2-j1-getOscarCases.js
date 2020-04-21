// GET new OSCaR cases
// User Story 2: View Oscar cases in Primero
// User Story 4: Sending referrals to Primero  >>Q: Can we collapse w/ job f4-j1?
post(
  //Oscar authentication
  '/api/v1/auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  get('/api/v1/organizations/clients?since_date', {
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
      // since_date: state.lastQueryDate,
      since_date: "2020-03-01",
    },
  })
);
