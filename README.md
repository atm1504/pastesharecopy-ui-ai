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

**URL**: https://lovable.dev/projects/d196a411-8a8f-4b8d-a7e9-31b4db046175

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/d196a411-8a8f-4b8d-a7e9-31b4db046175) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/d196a411-8a8f-4b8d-a7e9-31b4db046175) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
