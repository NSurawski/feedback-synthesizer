# Agentic AI User Feedback Synthesizer

## Problem & Product Insight
Product Managers often spend hours manually reading qualitative user feedback from surveys, support tickets, or reviews. This process is:
- Time-consuming and inconsistent  
- Difficult to prioritize which issues or features matter most  
- Prone to human bias, making product decisions less confident  

This project explores how an autonomous AI workflow can structure and summarize feedback, helping PMs quickly extract actionable insights and prioritize effectively.

## Approach & Decision Making
I designed this tool as a **multi-step agentic AI workflow** rather than a simple summarizer, so that it could autonomously:
1. Cluster similar feedback into meaningful themes  
2. Extract key insights and recurring pain points  
3. Analyze sentiment to understand overall user perception  
4. Produce a structured output ready for decision-making  

**Tradeoffs considered:**
- Clustering sometimes over-generalizes distinct feedback  
- Human-in-the-loop validation could improve accuracy but wasn’t included in this self-initiated project  
- Prioritized clarity and workflow autonomy over full integration with live data sources  

## Impact & Learnings
Even as a self-initiated project, this synthesizer demonstrates how agentic AI can:
- Reduce the time needed to process qualitative feedback from hours to minutes  
- Highlight patterns and recurring themes that might be missed manually  
- Provide PMs with structured insights that support prioritization decisions  

**Key learning:**  
Effective PM solutions don’t just automate tasks—they also improve clarity and decision confidence. Designing autonomous workflows requires careful tradeoffs between accuracy, autonomy, and interpretability.

**Real-world PM use case:**  
A PM could use this tool after collecting survey responses or support tickets to quickly identify patterns and prioritize next steps, making decisions faster and more confidently.

## Tech Stack
- **Frontend:** React + TypeScript + Vite  
- **AI:** OpenAI GPT / LangChain  
- **Styling:** Tailwind CSS  
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
