alterState(state => {
  console.log(`✓ Successfully authenticated with ${state.configuration.url}`);
  return { ...state, body: {}, references: [] };
});