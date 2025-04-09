import { Chroma } from "@langchain/chroma";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "langchain/document";
import { config } from "../config";
import fs from "fs-extra";
import logger from "../utils/logger";

// Initialize OpenAI embeddings with custom endpoint
export const embeddings = new OpenAIEmbeddings({
  openAIApiKey: config.openai.apiKey,
  configuration: {
    baseURL: config.openai.baseUrl
  },
  modelName: 'text-embedding-3-large'
});

// Create or get existing vector store
export async function getVectorStore(docs?: Document[]) {
  // Ensure the ChromaDB directory exists
  await fs.ensureDir(config.application.chromaDirectory);
  
  // Create Chroma client
  const vectorStore = new Chroma(embeddings, {
    collectionName: "code_assistant",
    url: "http://localhost:8000", // Default ChromaDB URL if running locally
    collectionMetadata: {
      "hnsw:space": "cosine"
    },
    path: config.application.chromaDirectory
  });
  
  // If documents are provided, add them to the store
  if (docs && docs.length > 0) {
    logger.info(`Adding ${docs.length} documents to vector store...`);
    await vectorStore.addDocuments(docs);
    logger.info("Documents added to vector store successfully.");
  }
  
  return vectorStore;
}

// Check if vector store already has documents
export async function hasDocuments(): Promise<boolean> {
  try {
    if (!fs.existsSync(config.application.chromaDirectory)) {
      return false;
    }
    
    const vectorStore = await getVectorStore();
    const collection = await vectorStore.collection;
    const count = await collection.count();
    
    return count > 0;
  } catch (error) {
    logger.error("Error checking vector store:", error);
    return false;
  }
}