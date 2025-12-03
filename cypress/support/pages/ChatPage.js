class ChatPage {
  elements = {
    agentSelector: () => cy.get('[data-cy="agent-selector"]'),
    chatInput: () => cy.get('[data-cy="chat-input"]'),
    sendBtn: () => cy.get('[data-cy="send-btn"]'),
    clearBtn: () => cy.get('[data-cy="clear-btn"]'),
    messageUser: () => cy.get('[data-cy="message-user"]'),
    messageAssistant: () => cy.get('[data-cy="message-assistant"]'),
    quickSuggestion: () => cy.get('[data-cy="quick-suggestion"]'),
    loadingSpinner: () => cy.get('.animate-spin')
  }

  visit() {
    cy.visit('/dashboard'); // Assuming route is /agents or /chat
  }

  selectAgent(agentValue) {
    this.elements.agentSelector().select(agentValue);
  }

  typeMessage(text) {
    this.elements.chatInput().type(text);
  }

  sendMessage() {
    this.elements.sendBtn().click();
  }

  sendQuickSuggestion(index = 0) {
    this.elements.quickSuggestion().eq(index).click();
    this.elements.sendBtn().click();
  }

  clearConversation() {
    this.elements.clearBtn().click();
  }

  getLastAssistantMessage() {
    return this.elements.messageAssistant().last();
  }
}

export const chatPage = new ChatPage();