getCases({
  remote: true,
  scope: {
    transitions_created_at: `dateRange||${state.lastFetch}.20-Apr-2021`,
    service_response_types: 'list||referral_to_oscar',
  },
});
