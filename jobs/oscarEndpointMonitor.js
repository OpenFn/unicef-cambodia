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
    console.log(`✓ Successfully authenticated with ${state.configuration.baseUrl}`);
    return { ...state, body: {}, references: [] };
  }
);