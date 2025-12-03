class DashboardPage {
  elements = {
    // Using a generic selector that likely wraps the main content
    mainContainer: () => cy.get('div.min-h-screen'),
    loadingSpinner: () => cy.get('.animate-spin')
  }

  visit() {
    cy.visit('/dashboard');
  }

  waitUntilLoaded() {
    cy.location('pathname').should('include', '/dashboard');
    this.elements.loadingSpinner().should('not.exist');
    this.elements.mainContainer().should('be.visible');
  }

  navigateToAgents() {
    cy.visit('/agents');
  }
}

export const dashboardPage = new DashboardPage();