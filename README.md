# Lecture Buddy - AI Learning Assistant

**Live Demo:** [https://felixhertweck.github.io/local-lecture-buddy/](https://felixhertweck.github.io/local-lecture-buddy/)

A comprehensive AI-powered learning assistant with OCR, text optimization, and intelligent analysis tools – built with Next.js and Chrome's Built-in AI APIs.

Lecture Buddy runs **completely locally** in your browser. Your data never leaves your device. Maximum privacy meets innovative learning support.

## ⚠️ Important: Built-in AI Limitations

This application uses **Chrome's experimental Built-in AI APIs** which have important limitations:

- **Chrome Desktop Only**: Features (Summarizer, and Translator) only work on Chrome 138+ (Desktop), not on mobile or other browsers
- **Experimental**: AI Chat is an experimental APIs subject to breaking changes in future Chrome versions
- **Origin Trial Required**: Requires active origin trial registration for production use
- **Model Download Required**: AI models are automatically downloaded on first use (several hundred MB)
- **Performance**: Depends on device capabilities; works best on newer hardware with sufficient RAM
- **Fallback**: All core features (Input, OCR, Text Editing) work in any modern browser without AI APIs

**More Info:** [Chrome AI Built-in Docs](https://developer.chrome.com/docs/ai/built-in)

## Project Overview

### Workflow

1. **Input**: Upload an image, take a photo, or enter text
2. **Optimizer**: OCR processing (for images) or text editing
3. **Tools**: Use AI Chat, Summarizer, and Translator
4. **Results**: Export results or process further

### Flexible Input

- **Image Upload**: Supports image files up to 10MB (JPG, PNG, WebP)
- **Camera Capture**: Take photos directly via webcam or mobile camera
- **Text Input**: Direct text input or copy-paste

### Intelligent Data Optimization

- **OCR Processing**: Automatic text recognition from images using Tesseract.js
- **Manual Editing**: Post-process extracted text if needed

### Advanced AI Tools

- **AI Chat**: Intelligent conversation with context awareness
  - Text-only or Multimodal (Text + Image)
  - Based on your learning materials
  - Streaming responses for quick interaction
  - Support for various language combinations

- **AI Summarizer**: Intelligent summarization
  - Various types: Key Points, TL;DR, Teaser, Headline
  - Adjustable length: Short, Medium, Long
  - Export options: Copy to clipboard or download

- **API Translator**: Multilingual support
  - Automatic language detection
  - Support for 100+ languages
  - Locally processed

### Tech Stack

- **Framework**: Next.js (React)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Context API with useReducer
- **OCR**: Tesseract.js
- **AI Backend**: Chrome Built-in AI APIs
  - Language Model API (Chat)
  - Summarizer API
  - Translator API
  - Language Detector API
- **Toast Notifications**: Sonner
- **Theme**: Dark/Light/System Mode

### Project Structure

```
local-lecture-buddy/
├── app/                         # Next.js App Router
│   ├── layout.tsx               # Root Layout
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global Styles
│
├── components/                  # React Components
│   ├── custom-ui/
│   │
│   ├── dialogs/
│   │
│   ├── input/                   # Input Handling
│   │
│   ├── layout/
│   │
│   ├── optimizer/               # Optimization (OCR)
│   │
│   ├── tools/                   # AI Tools
│   │
│   └── ui/                      # shadcn/ui Components
│
├── lib/                         # Utilities & Helpers
│   │
│   ├── contexts/
│   │
│   └── types/                   # TypeScript Definitions
│
├── public/                      # Public Assets
```

### Component Architecture

- **Input Step**: Image/text upload and processing
- **Optimizer Step**: OCR and text editing
- **Tools Step**: AI Chat, Summarizer, Translator
- **Results Step**: Export and result display

## Installation & Deployment

### Quick Start with Docker

```bash
docker-compose up -d
# Open http://localhost:3000
```

### Local Installation

```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Code Standards

- **TypeScript**: Full type coverage
- **ESLint**: All files must pass linting
- **Prettier**: Automatic code formatting
- **React**: Functional components with hooks
