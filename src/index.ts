import { loadDocumentsFromDirectory, splitDocuments } from "./loaders/fileLoader";
import { getVectorStore, hasDocuments } from "./vectorstore/chromaStore";
import { startServer } from "./chat/server";
import { config } from "./config";

async function main() {
  console.log("Starting Code Assistant...");
  console.log(`Code directory: ${config.application.codeDirectory}`);
  console.log(`ChromaDB directory: ${config.application.chromaDirectory}`);
  
  try {
    // Check if we already have documents in the vector store
    const docsExist = await hasDocuments();
    
    if (!docsExist) {
      console.log("No existing documents found in vector store. Loading and indexing...");
      
      // Load documents from directory
      const documents = await loadDocumentsFromDirectory();
      
      if (documents.length === 0) {
        throw new Error(`No documents found in ${config.application.codeDirectory}`);
      }
      
      // Split into chunks
      const chunks = await splitDocuments(documents);
      
      // Store in vector database
      await getVectorStore(chunks);
      
      console.log("Indexing complete!");
    } else {
      console.log("Using existing vector store...");
    }
    
    // Start the server
    await startServer();
    
  } catch (error) {
    console.error("Error starting application:", error);
    process.exit(1);
  }
}

// Run the application
main();