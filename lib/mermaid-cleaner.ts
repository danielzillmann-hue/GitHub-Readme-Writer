export function cleanMermaidDiagram(markdown: string): string {
    // Find all mermaid code blocks
    const mermaidRegex = /```mermaid\n([\s\S]*?)```/g;

    return markdown.replace(mermaidRegex, (match, diagramContent) => {
        // Clean up the diagram content
        let cleaned = diagramContent
            // Remove <br> tags
            .replace(/<br\s*\/?>/gi, ' ')
            // Remove parentheses from node definitions
            .replace(/([A-Z]\d*)\([^)]*\)/g, '$1')
            // Remove special characters from labels except brackets
            .replace(/\[([^\]]*)\]/g, (m, label) => {
                // Keep only alphanumeric, spaces, and basic punctuation in labels
                const cleanLabel = label.replace(/[^a-zA-Z0-9\s\-_.,]/g, '');
                return `[${cleanLabel}]`;
            })
            // Ensure proper arrow syntax
            .replace(/-->/g, ' --> ')
            // Remove extra whitespace
            .replace(/\s+/g, ' ')
            .trim();

        return '```mermaid\n' + cleaned + '\n```';
    });
}

export function validateMermaidSyntax(markdown: string): string {
    // If there are any Mermaid diagrams with obvious syntax errors, remove them
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
