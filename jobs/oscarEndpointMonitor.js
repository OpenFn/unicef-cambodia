post(
  '/api/v1/admin_auth/sign_in',
  {
    keepCookie: true,
    body: {
      email: state.configuration.username,
      password: state.configuration.password,
    },
  },
  state => {
    state.configuration = 'REDACTED'
    console.log(JSON.stringify(state, null, 2));
    state.body = {}
    state.references = []
    return state;
  }
);