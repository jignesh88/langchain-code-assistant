import { ConversationTokenBufferMemory } from "langchain/memory";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config";

// Create a token counter based on OpenAI models
const chatModel = new ChatOpenAI({
  openAIApiKey: config.openai.apiKey,
  configuration: {
    baseURL: config.openai.baseUrl
  },
  modelName: config.openai.modelName
});

// Create memory instance with token limit
export function createMemory() {
  return new ConversationTokenBufferMemory({
    llm: chatModel,
    maxTokenLimit: 2000,
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "query"
  });
}