# Contributing to BreakIn.ai

Thank you for your interest in contributing to BreakIn.ai! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

Please be respectful and constructive in all interactions. We aim to create a welcoming environment for all contributors.

## Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/BreakIn.ai.git
   cd BreakIn.ai
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/original-owner/BreakIn.ai.git
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Create a `.env` file based on `.env.example`
6. Build and run the project:
   ```bash
   npm run build
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
   or
   ```bash
   git checkout -b fix/your-bug-fix
   ```

2. Make your changes following our coding standards

3. Test your changes thoroughly

4. Commit your changes (see commit guidelines below)

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript for all backend code
- Follow existing code style and patterns
- Use meaningful variable and function names
- Add type annotations where appropriate
- Avoid using `any` type unless absolutely necessary

### File Organization

- Keep files focused on a single responsibility
- Place related files in appropriate directories:
  - `/src/routes` - API route handlers
  - `/src/modules` - Resume optimization modules
  - `/src/middleware` - Express middleware
  - `/src/services` - Business logic and external services
  - `/src/utils` - Utility functions

### Code Quality

- Write clean, readable code
- Add comments for complex logic
- Remove commented-out code before committing
- Use meaningful commit messages
- Keep functions small and focused

## Commit Guidelines

We follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(resume): add PDF export functionality

- Implemented PDF generation using jsPDF
- Added export button to resume preview
- Includes proper formatting and styling

Closes #123
```

```bash
fix(api): resolve rate limiting issue

Fixed rate limiter incorrectly blocking valid requests
```

## Pull Request Process

1. **Update Documentation**: Update README.md or other docs if needed

2. **Test Your Changes**: Ensure all tests pass and code builds successfully
   ```bash
   npm run build
   npm run dev
   ```

3. **Create Pull Request**:
   - Use a clear, descriptive title
   - Describe what changes you made and why
   - Reference any related issues
   - Include screenshots for UI changes

4. **Code Review**:
   - Respond to feedback promptly
   - Make requested changes
   - Keep discussions respectful

5. **Merge**:
   - PR will be merged once approved
   - Delete your branch after merge

## Areas for Contribution

We welcome contributions in these areas:

### High Priority

- LLM integration (OpenAI, Anthropic, etc.)
- Real job aggregation APIs
- Resume template improvements
- Test coverage
- Documentation improvements

### Feature Requests

- Cover letter generator
- LinkedIn profile optimizer
- Interview preparation tools
- Salary negotiation assistant
- Application tracker enhancements

### Bug Fixes

- Check the Issues page for known bugs
- Report new bugs with detailed reproduction steps

## Testing

Before submitting a PR:

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Test all affected endpoints and features

4. Check for TypeScript errors:
   ```bash
   npm run build
   ```

## Questions?

If you have questions:

- Check existing issues and discussions
- Create a new issue with the `question` label
- Be specific and provide context

## Thank You!

Your contributions help make BreakIn.ai better for everyone. We appreciate your time and effort!
