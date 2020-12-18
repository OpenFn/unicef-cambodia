alterState(state => {
  console.log('Authentication test succeeded.');
  return { ...state, data: {}, references: [] };
});
