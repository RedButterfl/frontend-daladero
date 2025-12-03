Cypress.Commands.add('loginByApi', (email, password) => {
  cy.session([email, password], () => {
    cy.request({
      method: 'POST',
      // We point directly to your backend API port (8000 based on your api file)
      url: 'http://localhost:8000/auth/login', 
      body: {
        email,
        password,
      },
    }).then((response) => {
      // Validate response structure
      expect(response.status).to.eq(200);
      
      // Set the token in localStorage exactly how your app expects it
      // Based on your api.interceptors logic:
      window.localStorage.setItem('access_token', response.body.access_token);
      window.localStorage.setItem('refresh_token', response.body.refresh_token);
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    });
  }, {
    cacheAcrossSpecs: true // Keeps you logged in between different test files (Faster!)
  });
});