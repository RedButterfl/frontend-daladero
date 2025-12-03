import { authPage } from '../support/pages/AuthPage';

describe('Authentication Flow', () => {
  let authData;

  before(() => {
    cy.fixture('auth').then((data) => {
      authData = data;
    });
  });

  beforeEach(() => {
    authPage.visit();
  });

  it('should validate form inputs before submission', () => {
    authPage.elements.submitBtn().click();
    authPage.elements.errorMessage().should('contain', 'email est requis');

    authPage.elements.emailInput().type(authData.validation.invalidEmail);
    authPage.elements.submitBtn().click();
    authPage.elements.errorMessage().should('contain', 'mot de passe est requis');

    authPage.elements.emailInput().clear().type(authData.validUser.email);
    authPage.elements.passwordInput().type(authData.validation.shortPassword);
    authPage.elements.submitBtn().click();
    authPage.elements.errorMessage().should('contain', '6 caractères');
  });

  it('should successfully login an existing user', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-refresh-token',
        user: { id: 1, email: authData.validUser.email }
      }
    }).as('loginRequest');

    authPage.login(authData.validUser.email, authData.validUser.password);

    cy.wait('@loginRequest');
    cy.window().its('localStorage.access_token').should('eq', 'fake-jwt-token');
  });

  it('should handle login errors gracefully', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 401,
      body: { detail: 'Unauthorized' }
    }).as('loginFail');

    authPage.login(authData.invalidUser.email, authData.invalidUser.password);

    cy.wait('@loginFail');
  });

  it('should switch to signup page and register a new user', () => {
    cy.intercept('POST', '**/auth/signup', {
      statusCode: 201,
      body: {
        access_token: 'new-user-token',
        user: { id: 2, email: authData.newUser.email }
      }
    }).as('signupRequest');

    authPage.elements.confirmPasswordInput().should('not.exist');

    authPage.switchToSignup();

    authPage.submitSignup(
      authData.newUser.email, 
      authData.newUser.password, 
      authData.newUser.confirmPassword
    );

    cy.wait('@signupRequest');
  });

  it('should successfully login an existing user', () => {
    cy.intercept('POST', '**/auth/login', {
      statusCode: 200,
      body: {
        access_token: 'fake-jwt-token',
        refresh_token: 'fake-refresh-token',
        user: { id: 1, email: authData.validUser.email }
      }
    }).as('loginRequest');

    authPage.submitLogin(authData.validUser.email, authData.validUser.password);

    cy.wait('@loginRequest');
    cy.window().its('localStorage.access_token').should('eq', 'fake-jwt-token');
  });

  it('should validate form inputs', () => {
    authPage.elements.submitBtn().click();
    authPage.elements.emailInput().type(authData.validation.invalidEmail);
    authPage.elements.submitBtn().click();
  });

  it('should toggle password visibility', () => {
    authPage.elements.passwordInput().type('secret');
    authPage.elements.passwordInput().should('have.attr', 'type', 'password');
    
    authPage.togglePasswordVisibility();
    authPage.elements.passwordInput().should('have.attr', 'type', 'text');
    
    authPage.togglePasswordVisibility();
    authPage.elements.passwordInput().should('have.attr', 'type', 'password');
  });
});