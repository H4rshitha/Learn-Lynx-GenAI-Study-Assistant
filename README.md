# Learn Lynx: GenAI Powered Study Tutor and Learning Assistant

## Overview

Learn-Lynx is an AI-powered study assistant designed to provide personalized, efficient, and interactive learning support. It leverages Retrieval-Augmented Generation (RAG) and large language models to help students understand concepts, resolve doubts, and prepare for exams effectively.

The system integrates document-based knowledge with real-time reasoning to deliver accurate and context-aware responses.

---

## Problem Statement

Students face several challenges in traditional learning environments:

- Lack of personalized guidance  
- Delayed doubt resolution  
- Inefficient revision strategies  
- Difficulty understanding complex topics  
- Limited access to structured practice  

These issues reduce learning efficiency and increase exam-related stress.

---

## Solution

Learn Lynx addresses these problems through:

- Context aware question answering  
- AI-generated quizzes for practice  
- Automated summarization of study material  
- Retrieval of relevant information from uploaded documents  
- Grounded responses using both internal and external knowledge  

---

## Key Features

### Knowledge Base Creation (RAG)

- Upload study materials in PDF format  
- Extract, clean, and process text  
- Generate embeddings and store in ChromaDB  
- Enable semantic retrieval  

### Intelligent Question Answering

- Retrieves relevant context from stored documents  
- Uses Gemini for response generation  
- Supports follow-up queries  

### Quiz Generation

- Automatically generates MCQs  
- Evaluates answers  
- Provides feedback  

### Summarization

- Generates concise summaries  
- Simplifies complex concepts  

### Grounded Responses

- Combines retrieval and reasoning  
- Reduces hallucinations  

### Conversational Interface

- Natural language interaction  
- Maintains context across queries  

---

## Tech Stack

- Python  
- Google Gemini  
- LangChain  
- ChromaDB  
- pdfplumber  

---

## Installation

```bash
pip install chromadb
pip install google-generativeai
pip install langchain
pip install pdfplumber
pip install tqdm
