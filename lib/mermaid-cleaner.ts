const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;

return markdown.replace(mermaidRegex, (match, diagramContent) => {
    // Check for common syntax errors
    const hasParentheses = /\([^)]*\)/.test(diagramContent);
    const hasBrTags = /<br/i.test(diagramContent);
    const hasInvalidChars = /[{}()]/g.test(diagramContent.replace(/graph\s+TD/i, ''));

    if (hasParentheses || hasBrTags || hasInvalidChars) {
        // Return a simple, safe diagram
        return `\`\`\`mermaid
graph TD
    A[Application] --> B[Components]
    B --> C[Services]
\`\`\``;
    }

    return match;
});
}
