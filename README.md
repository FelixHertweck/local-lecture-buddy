# Lecture Buddy - AI Learning Assistant

**Live Demo:** [https://felixhertweck.github.io/local-lecture-buddy/](https://felixhertweck.github.io/local-lecture-buddy/)

A comprehensive AI-powered learning assistant with OCR, and intelligent analysis tools – built with Next.js and Chrome's Built-in AI APIs.

Lecture Buddy runs **completely locally** in your browser. Your data never leaves your device. Maximum privacy meets innovative learning support.

It is optimized for mobile devices but works on desktop as well.

## Important Limitations for Built-in AI

This application uses **[Chrome's experimental Built-in AI APIs](https://developer.chrome.com/docs/ai/built-in)** which have currently important limitations:

**Chrome Desktop Only:**  
All main features (chat, summarizer, translator) only work on Chrome 138+ (Desktop) and Edge (Desktop), **not on mobile or other browsers**

**Experimental:**  
AI Chat is an experimental APIs subject to breaking changes in future Chrome versions (**tested on Chrome version 144.0.7559.133** (latest build from 2026-07-02))

**Origin Trial Required:**  
Requires active origin trial registration for production use (exists for localhost and [GitHub Pages](https://felixhertweck.github.io/local-lecture-buddy/))

**Model Download Required:**  
AI models are automatically downloaded on first use (several hundred MB), which may take time and consume bandwidth

**Performance:**  
Depends on device capabilities; works best on newer hardware with sufficient RAM

**More Infos about the API status:** [Chrome AI Built-in Docs](https://developer.chrome.com/docs/ai/built-in)

## Debug

View the [on-device internals](chrome://on-device-internals/) in your Chrome browser to see model details and debug information.

## Project Overview

### Used HTML-5 features:

- **Media Devices API**: Real-time camera access for image capture via `getUserMedia()`
- **File API**: Local file access and processing for the OCR engine
- **Geolocation API**: User's geographic location for target language in translation
- **CSS3 Media Queries**: Responsive mobile and desktop layouts optimized for all screen sizes
- **Prefers Color Scheme**: Automatic light/dark mode detection based on system preferences

### Workflow

1. **Input**: Upload an image, take a photo, or enter text
2. **Optimizer**: OCR processing (for images) or text editing, to enhance the input data
3. **Tools**: Use AI to chat, summarize, or translate
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
  - Based on your uploaded materials
  - Streaming responses for quick interaction
  - Support for various language combinations

- **AI Summarizer**: Intelligent summarization
  - Various types: Key Points, TL;DR, Teaser, Headline
  - Adjustable length: Short, Medium, Long
  - Export options: Copy to clipboard or download

- **API Translator**: Multilingual support
  - Automatic language detection based on physical location and browser language
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
