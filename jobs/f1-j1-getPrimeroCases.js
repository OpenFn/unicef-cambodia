getCases({
  remote: true,
  scope: {
    registration_date: `date_range||${state.lastFetch}.22-Mar-2020`,
    // transitions_created_at: `date_range||${state.lastFetch}.22-Mar-2020`,
    service_response_types: 'list||referral_to_oscar',
  },
});
