/**
 * Text formatting utilities for rich text editing with Markdown-style formatting
 */

export interface TextSelection {
  start: number;
  end: number;
  selectedText: string;
}

export interface TextFormatResult {
  newContent: string;
  newCursorPosition: number;
}

/**
 * Get current text selection from a textarea element
 */
export function getTextSelection(element: HTMLTextAreaElement): TextSelection {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  const selectedText = element.value.substring(start, end);
  
  return { start, end, selectedText };
}

/**
 * Wrap selected text with prefix and suffix
 */
export function wrapSelectedText(
  content: string,
  selection: TextSelection,
  prefix: string,
  suffix: string = prefix
): TextFormatResult {
  const { start, end, selectedText } = selection;
  
  // If text is already wrapped, unwrap it
  const beforeSelection = content.substring(Math.max(0, start - prefix.length), start);
  const afterSelection = content.substring(end, end + suffix.length);
  
  if (beforeSelection === prefix && afterSelection === suffix) {
    // Unwrap
    const newContent = 
      content.substring(0, start - prefix.length) +
      selectedText +
      content.substring(end + suffix.length);
    
    return {
      newContent,
      newCursorPosition: start - prefix.length + selectedText.length
    };
  } else {
    // Wrap
    const newContent = 
      content.substring(0, start) +
      prefix + selectedText + suffix +
      content.substring(end);
    
    return {
      newContent,
      newCursorPosition: start + prefix.length + selectedText.length + suffix.length
    };
  }
}

/**
 * Insert text at cursor position
 */
export function insertAtCursor(
  content: string,
  position: number,
  textToInsert: string
): TextFormatResult {
  const newContent = 
    content.substring(0, position) +
    textToInsert +
    content.substring(position);
  
  return {
    newContent,
    newCursorPosition: position + textToInsert.length
  };
}

/**
 * Toggle list formatting on current line(s)
 */
export function toggleListFormat(
  content: string,
  selection: TextSelection
): TextFormatResult {
  const { start, end } = selection;
  const lines = content.split('\n');
  let lineStart = 0;
  let startLineIndex = 0;
  let endLineIndex = 0;
  
  // Find which lines are selected
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = lineStart + lines[i].length;
    
    if (start >= lineStart && start <= lineEnd && startLineIndex === 0) {
      startLineIndex = i;
    }
    if (end >= lineStart && end <= lineEnd) {
      endLineIndex = i;
    }
    
    lineStart = lineEnd + 1; // +1 for newline character
  }
  
  // Check if all selected lines already have list formatting
  const selectedLines = lines.slice(startLineIndex, endLineIndex + 1);
  const allAreListItems = selectedLines.every(line => line.trim().startsWith('- '));
  
  let newLines = [...lines];
  
  if (allAreListItems) {
    // Remove list formatting
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      if (newLines[i].trim().startsWith('- ')) {
        newLines[i] = newLines[i].replace(/^(\s*)- /, '$1');
      }
    }
  } else {
    // Add list formatting
    for (let i = startLineIndex; i <= endLineIndex; i++) {
      if (!newLines[i].trim().startsWith('- ') && newLines[i].trim() !== '') {
        const leadingWhitespace = newLines[i].match(/^\s*/)?.[0] || '';
        newLines[i] = leadingWhitespace + '- ' + newLines[i].trim();
      }
    }
  }
  
  const newContent = newLines.join('\n');
  
  return {
    newContent,
    newCursorPosition: end + (newContent.length - content.length)
  };
}

/**
 * Formatting functions for each action
 */
export const formatters = {
  bold: (content: string, selection: TextSelection) =>
    wrapSelectedText(content, selection, '**'),
    
  italic: (content: string, selection: TextSelection) =>
    wrapSelectedText(content, selection, '*'),
    
  underline: (content: string, selection: TextSelection) =>
    wrapSelectedText(content, selection, '<u>', '</u>'),
    
  code: (content: string, selection: TextSelection) =>
    wrapSelectedText(content, selection, '`'),
    
  list: (content: string, selection: TextSelection) =>
    toggleListFormat(content, selection),
    
  link: (content: string, selection: TextSelection) => {
    const { selectedText } = selection;
    const linkText = selectedText || 'enllaç';
    return wrapSelectedText(content, selection, `[${linkText}](`, ')');
  },
  
  image: (content: string, selection: TextSelection) => {
    const { selectedText } = selection;
    const altText = selectedText || 'imatge';
    return wrapSelectedText(content, selection, `![${altText}](`, ')');
  }
};