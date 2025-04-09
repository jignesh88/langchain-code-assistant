# LangChain Code Assistant

A TypeScript application that uses LangChain with ChromaDB to load, process, and query your local code files using OpenAI with a custom endpoint.

## Features

- Load and process code files from a local directory
- Store them in ChromaDB as vector embeddings
- Connect to OpenAI with a custom endpoint
- Provide a chat interface for questions and answers about your code
- Handle conversations with memory and context

## Installation

```bash
# Clone the repository
git clone https://github.com/jignesh88/langchain-code-assistant.git
cd langchain-code-assistant

# Install dependencies
npm install
```

## Configuration

Copy the example environment file and update it with your settings:

```bash
cp .env.example .env
```

Edit the `.env` file to include your OpenAI API key and custom endpoint URL.

## Usage

### Start ChromaDB

Using Docker:

```bash
docker run -p 8000:8000 chromadb/chroma
```

Or with pip:

```bash
pip install chromadb
python -c "import chromadb; chromadb.PersistentClient('./chroma-db')"
```

### Run the application

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm run build
npm start
```

Visit `http://localhost:3000` to use the chat interface.

## License

MIT
