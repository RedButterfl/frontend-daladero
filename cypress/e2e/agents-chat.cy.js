import { chatPage } from '../support/pages/ChatPage';

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
    cy.loginByApi(authData.validUser.email, authData.validUser.password);
    chatPage.visit();
  });

  it('should send a standard message to Knowledge Assistant and display response', () => {
    cy.intercept('POST', '**/agents/chat', {
      statusCode: 200,
      body: chatData.responses.standard,
      delay: 500
    }).as('chatRequest');

    chatPage.typeMessage(chatData.messages.hello);
    chatPage.sendMessage();

    chatPage.elements.messageUser().last().should('contain', chatData.messages.hello);
    chatPage.elements.sendBtn().should('be.disabled');
    
    cy.wait('@chatRequest');

    chatPage.elements.messageAssistant().last().should('contain', chatData.responses.standard.output);
    chatPage.elements.messageAssistant().last().should('contain', 'cv.pdf');
  });

  it('should switch agents and update the interface', () => {
    chatPage.selectAgent('research_specialist');
    chatPage.elements.messageAssistant().last().should('contain', 'Spécialiste Recherche');
    
    chatPage.selectAgent('memory_manager');
    chatPage.elements.messageAssistant().last().should('contain', 'Memory Manager');
  });

  it('should handle Memory Manager streaming response', () => {
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
    
    chatPage.elements.messageAssistant().last().should('contain', 'I understand.');
  });

  it('should populate input when clicking a quick suggestion', () => {
    chatPage.elements.quickSuggestion().first().then(($btn) => {
      const suggestionText = $btn.text();
      chatPage.elements.quickSuggestion().first().click();
      chatPage.elements.chatInput().should('have.value', suggestionText);
    });
  });

  it('should clear the conversation history', () => {
    cy.intercept('DELETE', '**/agents/sessions/*', {
      statusCode: 200,
      body: { success: true }
    }).as('clearSession');

    chatPage.clearConversation();
    
    cy.wait('@clearSession');
    chatPage.elements.messageAssistant().last().should('contain', 'Conversation effacée');
  });
});