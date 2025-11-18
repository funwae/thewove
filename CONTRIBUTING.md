# Contributing to The Wove

Thank you for your interest in contributing to The Wove! This document provides guidelines and instructions for contributing.

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. We pledge to:

- Be kind and respectful
- Be patient with beginners
- Provide constructive feedback
- Assume good intentions
- Respect differing viewpoints
- Prioritize community well-being

### Anti-Gatekeeping

The Wove is built on anti-gatekeeping principles:

- No question is too basic
- All skill levels are welcome
- We celebrate learning and mistakes
- We provide context, not just answers
- We encourage experimentation

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/thewove/issues)
2. If not, create a new issue with:
   - Clear title
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, browser, versions)

### Suggesting Features

1. Check [Discussions](https://github.com/yourusername/thewove/discussions) for existing suggestions
2. Create a new discussion with:
   - Clear description of the feature
   - Use case and benefits
   - Potential implementation approach
   - Examples from other platforms (if applicable)

### Contributing Code

#### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/thewove.git
   cd thewove
   ```
3. Add upstream remote:
   ```bash
   git remote add upstream https://github.com/originalrepo/thewove.git
   ```
4. Follow setup instructions in [README.md](README.md)

#### Making Changes

1. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our coding standards

3. Test your changes:
   ```bash
   # Backend
   cd backend
   npm test
   npm run lint
   npm run type-check

   # Frontend
   cd frontend
   npm run build
   npm run lint
   npm run type-check
   ```

4. Commit with clear messages:
   ```bash
   git commit -m "Add feature: description of your feature"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request

#### Pull Request Guidelines

- **Title**: Clear and descriptive
- **Description**:
  - What changes were made
  - Why the changes were needed
  - Any breaking changes
  - Screenshots (for UI changes)
- **Tests**: Include tests for new features
- **Documentation**: Update docs if needed
- **Small PRs**: Keep PRs focused and reasonably sized

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Document complex types

### Code Style

**Backend (Fastify/Node.js)**
```typescript
// Use async/await
async function getUser(id: string): Promise<User> {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

// Error handling
try {
  const user = await getUser(id);
} catch (error) {
  logger.error({ error, userId: id }, 'Failed to get user');
  throw new Error('User not found');
}
```

**Frontend (React)**
```typescript
// Functional components with TypeScript
interface Props {
  username: string;
  onUpdate: (data: UserData) => void;
}

export function UserProfile({ username, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  // Clear, descriptive names
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ...
  };

  return (
    // ...
  );
}
```

### Naming Conventions

- **Files**: camelCase for utilities, PascalCase for components
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Components**: PascalCase
- **Types/Interfaces**: PascalCase
- **Database**: snake_case

### Git Commit Messages

Format:
```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(auth): add OAuth login support

Implemented Google and GitHub OAuth providers
using Auth0 integration.

Closes #123
```

```
fix(editor): prevent memory leak on file close

Fixed issue where Monaco editor instances were
not being disposed properly when closing files.

Fixes #456
```

## Testing

### Backend Tests

```bash
cd backend
npm test
```

Write tests for:
- API endpoints
- Service functions
- Database queries
- Utility functions

### Frontend Tests

```bash
cd frontend
npm test
```

Write tests for:
- Components
- Hooks
- API client
- Utility functions

## Documentation

- Update README.md for user-facing changes
- Update API documentation for new endpoints
- Add JSDoc comments for complex functions
- Update TypeScript types/interfaces

## Community

- **GitHub Discussions**: For questions and general discussion
- **GitHub Issues**: For bugs and feature requests
- **Pull Requests**: For code contributions

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` file
- Release notes
- Project documentation

## Questions?

Feel free to ask questions in [GitHub Discussions](https://github.com/yourusername/thewove/discussions).

Thank you for contributing to The Wove! 🚀
