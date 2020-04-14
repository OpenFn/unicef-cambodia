getCases({
  remote: true,
  scope: {
    transitions_created_at: `date_range||${state.lastFetch}.30-Mar-2020`,
    service_response_types: 'list||referral_to_oscar',
  },
});