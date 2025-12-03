import { chatPage } from '../support/pages/ChatPage';
import { dashboardPage } from '../support/pages/DashboardPage';

describe('AI Agents Chat Feature', () => {
  let authData;
  let chatData;

  before(() => {
    cy.fixture('auth').then((data) => {
      authData = data;
    });
    cy.fixture('chat').then((data) => {
      chatData = data;
    });
  });

  beforeEach(() => {
    cy.intercept('GET', '**/user/profile', { 
      statusCode: 200, 
      fixture: 'userProfile' 
    }).as('getProfile');

    cy.loginByApi(authData.validUser.email, authData.validUser.password);
    
    dashboardPage.visit();
    
    dashboardPage.waitUntilLoaded();

    dashboardPage.navigateToAgents();
  });

  it('should send a standard message to Knowledge Assistant', () => {
    cy.intercept('POST', '**/agents/chat', {
      statusCode: 200,
      body: chatData.responses.standard,
      delay: 500
    }).as('chatRequest');

    chatPage.typeMessage(chatData.messages.hello);
    chatPage.sendMessage();

    chatPage.elements.messageUser().last().should('contain', chatData.messages.hello);
    chatPage.elements.loadingSpinner().should('be.visible');
    
    cy.wait('@chatRequest');

    chatPage.elements.messageAssistant().last().should('contain', chatData.responses.standard.output);
  });

  it('should handle streaming response from Memory Manager', () => {
    chatPage.selectAgent('memory_manager');

    cy.intercept('POST', '**/api/v1/agents/memory-chat/stream', (req) => {
      req.reply({
        statusCode: 200,
        headers: { 'content-type': 'text/event-stream' },
        body: chatData.responses.memoryStream
      });
    }).as('streamRequest');

    chatPage.typeMessage(chatData.messages.streamQuery);
    chatPage.sendMessage();

    cy.wait('@streamRequest');
    
    chatPage.elements.messageAssistant().last().should('contain', 'I understand');
  });

  it('should clear the conversation', () => {
    cy.intercept('DELETE', '**/agents/sessions/*', {
      statusCode: 200,
      body: { success: true }
    }).as('clearSession');

    chatPage.clearConversation();
    
    cy.wait('@clearSession');
    chatPage.elements.messageAssistant().last().should('contain', 'Conversation effacée');
  });

  it('should use quick suggestions', () => {
    chatPage.elements.quickSuggestion().first().click();
    chatPage.elements.sendBtn().click();
    
    chatPage.elements.messageUser().should('exist');
  });
});