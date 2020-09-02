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
  state => {
  state.body = {}
  state.references = []
  return state;
  }
);
