import { OPENAI_API_KEY, OPENAI_ASSISTANT_ID, OPENAI_MODEL } from "$env/static/private";
import OpenAI from "openai";
import type { AIConversationProvider, Message } from "./provider";

const openai = new OpenAI({apiKey: OPENAI_API_KEY});

export class OpenAIConversationProvider implements AIConversationProvider {

  createThread = async (): Promise<string | null> => {
    try {
      const thread = await openai.beta.threads.create();

      if (!thread || (thread && !thread.id)) {
        console.error("[openai error]: unable to create thread");
        return null;
      }

      return thread.id;

    } catch (e) {
      console.error("[openai error]: unable to reach openai", e);
      return null;
    }
  }

  destroyThread = async (threadID: string): Promise<boolean> => {
    try {
      const deleted = (await openai.beta.threads.del(threadID)).deleted;
      if (!deleted) {
        console.error("[openai error]: unable to delete thread");
      }
      return deleted
    } catch (e) {
      console.error("[openai error]: unable to reach openai", e);
      return false;
    }
  }

  getMessages = async (threadID: string, afterID?: string): Promise<Array<Message> | null> => {
    try {
      const params = {limit: 100, after: ""}
      if (afterID) params.after = afterID

      let page = await openai.beta.threads.messages.list(threadID, params)
      let messages = page.data
      
      if (!messages) {
        console.error("[openai error]: unable to list messages");
      }

      return messages
        .filter((msg: OpenAI.Beta.Threads.Message) => msg.content[0].type === "text")
        .map((msg: OpenAI.Beta.Threads.Message): Message => {
          const textBlock = msg.content[0] as { type: "text"; text: { value: string } };
          return {
            id: msg.id,
            createdAt: msg.created_at,
            threadID: msg.thread_id,
            role: msg.role,
            content: {
              type: "text",
              text: textBlock.text.value,
            }
          }
      });

    } catch (e) {
      console.error("[openai error]: unable to reach openai", e);
      return null;
    }
  }

  addSystemMessage = async (threadID: string, content: string): Promise<boolean> => {
    try {
      const resp = await openai.beta.threads.messages.create(
        threadID, {role: "assistant", content}
      )
      if (!resp) {
        console.error("[openai error]: unable to add assistant message");
        return false;
      }
      return true
    } catch (e) {
      console.error("[openai error]: unable to reach openai", e);
      return false;
    }
  }

  converse = async (threadID: string, content: string): Promise<string | null> => {
    try {
      const message = await openai.beta
        .threads.messages.create( threadID, { role: "user", content } );

      if (!message || (message && !message.id)) {
        console.error("[openai error]: unable to attach message to thread");
        return null;
      }

      let run = await openai.beta
        .threads.runs.createAndPoll( threadID, { assistant_id: OPENAI_ASSISTANT_ID } );

      if (!run || (run && !run.id)) {
        console.error("[openai error]: unable to reach assistant");
        return null;
      }

      const messages = await openai.beta
        .threads.messages.list(threadID);

      if (!messages) {
        console.error("[openai error]: unable to list messages");
        return null;
      }

      const noMessageData = messages.data && messages.data.length === 0;
      if (noMessageData) {
        console.error("[openai error]: no messages on thread");
        return null;
      }

      const noResponseFromAgent = messages.data[0].content.length === 0;
      if (noResponseFromAgent) {
        console.error("[openai error]: last message empty");
        return null;
      }

      const messageContent = messages.data[0].content[0]
      if (messageContent.type != "text") {
        console.error("[openai error]: unexpected message type from assistant");
        return null;
      }

      return messageContent.text.value;

    } catch (e) {
      console.error("[openai error]: unable to reach openai", e);
      return null;
    }
  }

  summarize = async (content: string): Promise<string | null> => {
    try {
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "developer", content: "you are a life coach giving a weekly progress summary and tips for users to build Atomic Habits and achieve their goals. Look at the provided transcript and provide a short progress summary and tips using examples from the conversation. Be honest about areas that aren't as good and provide examples of how to be better. Keep your report under 1600 characters." },
          { role: "developer", content: "the format should be markdown and start with a h3 title stating what the overall goal and persona the user is striving for. There should be a section for overall progress which is a paragraph, what's going well, what could be improved, and tips and tricks for next week which should all be bulleted lists." },
          { role: "developer", content: `this is the transcript to analyze: ${content}`}
        ],
        model: OPENAI_MODEL,
        store: false,
      });

      if (!completion) {
        console.error("[openai error]: no summary returned");
        return null;
      }

      return completion.choices[0].message.content;

    } catch (e) {
      console.error("[openai error]: unable to reach openai", e)
      return null
    }
  }
}