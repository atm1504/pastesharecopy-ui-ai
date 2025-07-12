# PasteShareCopy - Code Snippet Sharing Platform

A sophisticated web application designed for developers to create, share, and store code snippets with ease.

## Overview

PasteShareCopy offers advanced syntax highlighting, multiple language support, and secure sharing features. The platform allows developers to quickly share formatted code snippets with customizable expiration times and optional password protection.

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for data fetching
- **Code Editor**: Custom implementation using @uiw/react-textarea-code-editor
- **Internationalization**: i18next with support for 6 languages (English, Spanish, French, German, Japanese, Chinese)
- **Routing**: React Router for navigation

## Core Features

### 1. Advanced Code Editor

- Syntax highlighting for 100+ programming languages
- Support for multiple themes (light/dark mode)
- Live preview for various formats (Markdown, HTML, CSS, JSON)
- Code validation
- Line numbers and code wrapping options
- Customizable font size and tab size

### 2. Secure Sharing

- Generate shareable links instantly
- Password protection option for sensitive code
- Flexible expiration options (1 day, 2 days, 3 days, 7 days)
- One-click copy to clipboard functionality

### 3. User Dashboard

- Track shared links with detailed statistics
- Monitor view counts and expiration dates
- Organized storage of all created snippets
- Quick access to recently shared code

### 4. Internationalization

- Complete multilingual support with 6 languages
- Automatic language detection based on browser settings
- Easy language switching via dropdown menu
- Consistent translations across all application features

### 5. Responsive Design

- Mobile-first approach ensuring functionality across all devices
- Dynamic background animations
- Modern UI with transitions and animations
- Accessible interface following best practices

### 6. Theme Support

- System-preference theme detection
- Toggleable light/dark mode
- Persistent theme preferences stored in local storage
- Custom theming for code editor to match application theme

## Project info

**URL**: https://pastesharecopy.com

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd pastesharecopy/pastesharecopy-ui-ai

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server.
npm run dev
```

The application will be available at `http://localhost:8080`.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
