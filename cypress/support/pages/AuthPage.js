class AuthPage {
  elements = {
    emailInput: () => cy.get('input[name="email"]'),
    passwordInput: () => cy.get('input[name="password"]'),
    confirmPasswordInput: () => cy.get('input[name="confirmPassword"]'),
    submitBtn: () => cy.get('button[type="submit"]'),
    toggleModeBtn: () => cy.get('button').contains(/créer un compte|se connecter/i),
    switchModeLink: () => cy.get('div.switchmodediv button.switchmodebtn'),
    errorMessage: () => cy.get('.text-red-600'),
    passwordToggleBtn: () => cy.get('button').find('svg.lucide-eye, svg.lucide-eye-off').parent()
  }

  visit() {
    cy.visit('/');
  }

  login(email, password) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    this.elements.submitBtn().click();
  }

  signup(email, password, confirmPassword) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    this.elements.confirmPasswordInput().clear().type(confirmPassword);
    this.elements.submitBtn().click();
  }

  toggleAuthMode() {
    this.elements.toggleModeBtn().click();
  }

  togglePasswordVisibility() {
    this.elements.passwordToggleBtn().click();
  }

  switchToSignup() {
    this.elements.switchModeLink().click();
    this.elements.confirmPasswordInput().should('be.visible');
  }

  switchToLogin() {
    this.elements.switchModeLink().click();
    this.elements.confirmPasswordInput().should('not.exist');
  }

  submitLogin(email, password) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    this.elements.submitBtn().click();
  }

  submitSignup(email, password, confirmPassword) {
    this.elements.emailInput().clear().type(email);
    this.elements.passwordInput().clear().type(password);
    this.elements.confirmPasswordInput().clear().type(confirmPassword);
    this.elements.submitBtn().click();
  }

  togglePasswordVisibility() {
    this.elements.passwordToggleBtn().click();
  }
}

export const authPage = new AuthPage();