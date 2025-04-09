import { ConversationalRetrievalQAChain } from "langchain/chains";
import { ChatOpenAI } from "@langchain/openai";
import { getVectorStore } from "../vectorstore/chromaStore";
import { config } from "../config";
import { createMemory } from "./memory";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import logger from "../utils/logger";

// Initialize OpenAI chat model with custom endpoint
const chatModel = new ChatOpenAI({
  openAIApiKey: config.openai.apiKey,
  configuration: {
    baseURL: config.openai.baseUrl
  },
  modelName: config.openai.modelName,
  temperature: 0.2
});

// Store memories for each session
const memories = new Map();

export async function handleQuery(query: string, sessionId: string = "default"): Promise<string> {
  try {
    logger.info(`Processing query from ${sessionId}: ${query}`);
    
    // Get or create memory for this session
    if (!memories.has(sessionId)) {
      memories.set(sessionId, createMemory());
    }
    const memory = memories.get(sessionId);
    
    // Get vector store
    const vectorStore = await getVectorStore();
    
    // Create conversational chain
    const chain = ConversationalRetrievalQAChain.fromLLM(
      chatModel,
      vectorStore.asRetriever({
        searchType: "mmr", // Use Maximum Marginal Relevance for diverse results
        k: 5, // Number of documents to retrieve
        fetchK: 20, // Consider more documents before choosing the final set
        lambda: 0.7 // Balance between relevance and diversity (0.0-1.0)
      }),
      {
        memory,
        returnSourceDocuments: true,
        verbose: config.environment === "development",
        qaChainOptions: {
          prompt: ChatPromptTemplate.fromTemplate(`
            You are a helpful code assistant specialized in explaining code.
            
            Use the following pieces of context and the chat history to answer the question.
            If you don't know the answer, just say that you don't know, don't try to make up an answer.
            Always format code blocks with appropriate syntax highlighting.
            
            Chat History: {chat_history}
            Context: {context}
            Question: {query}
            
            Answer:
          `)
        }
      }
    );
    
    // Execute query
    const response = await chain.invoke({
      query: query
    });
    
    // Format sources for better display
    let sourcesText = '';
    if (response.sourceDocuments && response.sourceDocuments.length > 0) {
      const uniqueSources = new Set();
      response.sourceDocuments.forEach((doc: any) => {
        if (doc.metadata && doc.metadata.source) {
          uniqueSources.add(doc.metadata.source);
        }
      });
      
      if (uniqueSources.size > 0) {
        sourcesText = '\n\n**Sources:**\n' + 
          Array.from(uniqueSources).map(source => `- ${source}`).join('\n');
      }
    }
    
    return response.text + sourcesText;
  } catch (error) {
    logger.error('Error in query handling:', error);
    throw error;
  }
}

// Clean up memory for a session
export function cleanupMemory(sessionId: string): boolean {
  if (memories.has(sessionId)) {
    memories.delete(sessionId);
    logger.info(`Cleaned up memory for session ${sessionId}`);
    return true;
  }
  return false;
}