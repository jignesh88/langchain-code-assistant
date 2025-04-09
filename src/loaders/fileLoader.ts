import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { DocxLoader } from "langchain/document_loaders/fs/docx";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";
import { config } from "../config";
import path from "path";
import logger from "../utils/logger";

// Custom loader for code files with appropriate metadata
class CodeLoader extends TextLoader {
  constructor(filePath: string) {
    super(filePath);
  }

  override async load(): Promise<Document[]> {
    const docs = await super.load();
    const fileExtension = path.extname(this.filePath).substring(1);
    const fileName = path.basename(this.filePath);
    
    return docs.map(doc => {
      return new Document({
        pageContent: doc.pageContent,
        metadata: {
          ...doc.metadata,
          fileName,
          fileType: fileExtension,
          language: fileExtension,
          source: this.filePath
        }
      });
    });
  }
}

// Function to determine loader type based on file extension
function getLoader(path: string) {
  const extension = path.split(".").pop()?.toLowerCase() || "";
  
  switch (extension) {
    case "json":
      return new JSONLoader(path);
    case "csv":
      return new CSVLoader(path);
    case "pdf":
      return new PDFLoader(path);
    case "docx":
      return new DocxLoader(path);
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "py":
    case "rb":
    case "java":
    case "c":
    case "cpp":
    case "go":
    case "rust":
    case "php":
    case "html":
    case "css":
    case "md":
      return new CodeLoader(path);
    default:
      return new TextLoader(path);
  }
}

// Load all documents from the specified directory
export async function loadDocumentsFromDirectory() {
  const loader = new DirectoryLoader(
    config.application.codeDirectory,
    {
      ".js": (path) => getLoader(path),
      ".ts": (path) => getLoader(path),
      ".jsx": (path) => getLoader(path),
      ".tsx": (path) => getLoader(path),
      ".py": (path) => getLoader(path),
      ".rb": (path) => getLoader(path),
      ".java": (path) => getLoader(path),
      ".c": (path) => getLoader(path),
      ".cpp": (path) => getLoader(path),
      ".go": (path) => getLoader(path),
      ".rs": (path) => getLoader(path),
      ".php": (path) => getLoader(path),
      ".html": (path) => getLoader(path),
      ".css": (path) => getLoader(path),
      ".md": (path) => getLoader(path),
      ".json": (path) => getLoader(path),
      ".txt": (path) => getLoader(path),
    }
  );

  logger.info(`Loading documents from ${config.application.codeDirectory}...`);
  const docs = await loader.load();
  logger.info(`Loaded ${docs.length} documents.`);
  
  return docs;
}

// Split documents into chunks appropriate for embedding
export async function splitDocuments(documents: Document[]) {
  // Special text splitter for code - respects code structure better
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 200,
    separators: [
      // First try to split by class/function definitions
      "\nclass ", "\nfunction ", "\nfunc ", "\ndef ", "\nasync function ", "\nconst ", "\nlet ", "\nvar ", "\nexport ",
      // Then try to split by control flow statements
      "\nif ", "\nfor ", "\nwhile ", "\nswitch ",
      // Then try standard markdown separators
      "\n# ", "\n## ", "\n### ", "\n#### ",
      // Then by newlines and periods
      "\n\n", "\n", ". ",
      // Finally character by character
      ""
    ]
  });

  logger.info("Splitting documents into chunks...");
  const chunks = await splitter.splitDocuments(documents);
  logger.info(`Created ${chunks.length} chunks.`);
  
  return chunks;
}