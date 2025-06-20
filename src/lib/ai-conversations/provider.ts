export type MessageRole = "assistant" | "user";

export type MessageContent = {
  type: "text";  // For now, we only support text
  text: string;
};

export type Message = {
  id: string;
  createdAt: number;
  threadID: string;
  role: MessageRole;
  content: MessageContent;
};

export interface AIConversationProvider {
  /**
   * Creates a new thread and returns its ID.
   */
  createThread(): Promise<string | null>;

  /**
   * Destroys the thread with the given ID.
   */
  destroyThread(threadID: string): Promise<boolean>;

  /**
   * Gets messages from a thread, optionally after a specific message ID.
   */
  getMessages(threadID: string, afterID?: string): Promise<Message[] | null>;

  /**
   * Adds a system (assistant) message to a thread.
   */
  addSystemMessage(threadID: string, content: string): Promise<boolean>;

  /**
   * Sends a user message and processes the assistant's reply.
   * Returns the assistant's reply as plain text.
   */
  converse(threadID: string, content: string): Promise<string | null>;

  /**
   * Summarizes the conversation content.
   * Returns a markdown string with the summary.
   */
  summarize(content: string): Promise<string | null>;
}
