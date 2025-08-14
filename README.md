# Wordle Assist App

Wordle Assist is a React-based application designed to help users with the popular word puzzle game, Wordle. This app provides useful features to enhance the Wordle playing experience.

## Table of Contents

- [Wordle Assist App](#wordle-assist-app)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Development](#development)
  - [Environment Variables](#environment-variables)
  - [Build](#build)
  - [Linting](#linting)
  - [Preview](#preview)

## Installation

To install the dependencies, run:

```bash
npm install
```

## Usage

To start the development server, run:

```bash
npm run dev
```

This will start the Vite development server and you can view the app in your browser at `http://localhost:5173`.

## Development 

The main entry point for the application is `src/main.tsx`. Ths main component is `src/App.tsx`.

## Environment Variables

For local development, you need to set up your environment variables:

1. Copy the example environment file to local environment file:

```bash
cp .env.local.example .env.local
```

2. Review and adjust the API URL in the `.env.local` file if necessary. By default, the example file is configured to connect to the API's standard local development URL.

## Build

To build the project, run:

```bash
npm run build
```

This will run ESLint on the project files.

## Linting

To lint the project, run:

```bash
npm run lint
```

## Preview

To preview the production build, run:

```bash
npm run preview
```

This will start a local server to preview the built application.