import { loadDocumentsFromDirectory, splitDocuments } from "../loaders/fileLoader";
import { getVectorStore } from "../vectorstore/chromaStore";
import fs from "fs-extra";
import { config } from "../config";
import logger from "./logger";

export async function refreshVectorStore() {
  logger.info("Refreshing vector store...");
  
  try {
    // Delete existing ChromaDB directory
    if (fs.existsSync(config.application.chromaDirectory)) {
      await fs.remove(config.application.chromaDirectory);
      logger.info("Removed existing vector store");
    }
    
    // Load and process documents
    const documents = await loadDocumentsFromDirectory();
    const chunks = await splitDocuments(documents);
    
    // Create new vector store
    await getVectorStore(chunks);
    
    logger.info("Vector store refreshed successfully!");
    return true;
  } catch (error) {
    logger.error("Error refreshing vector store:", error);
    return false;
  }
}