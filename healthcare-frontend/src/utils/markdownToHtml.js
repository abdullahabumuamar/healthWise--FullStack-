/**
 * Convert Markdown text to HTML
 * Supports headings, lists, bold, italic, and nested lists
 * @param {string} text - Markdown text to convert
 * @returns {string} - HTML string
 */
export const markdownToHtml = (text) => {
  if (!text) return "";
  
  let html = text;
  
  // Split into lines for better processing
  const lines = html.split('\n');
  const processedLines = [];
  let inList = false;
  let listType = null; // 'ul' or 'ol'
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const nextLine = i < lines.length - 1 ? lines[i + 1].trim() : '';
    
    // Check for headings
    if (line.startsWith('### ')) {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      processedLines.push(`<h4>${line.substring(4)}</h4>`);
      continue;
    } else if (line.startsWith('## ')) {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      processedLines.push(`<h3>${line.substring(3)}</h3>`);
      continue;
    } else if (line.startsWith('# ')) {
      if (inList) {
        processedLines.push(`</${listType}>`);
        inList = false;
      }
      processedLines.push(`<h3>${line.substring(2)}</h3>`);
      continue;
    }
    
    // Check for numbered list
    const numberedMatch = line.match(/^(\d+\.)\s+(.*)$/);
    if (numberedMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ol>');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`<li>${numberedMatch[2]}</li>`);
      continue;
    }
    
    // Check for bullet list (including nested with tabs/spaces)
    const originalLine = lines[i];
    const bulletMatch = line.match(/^[\*\-\+]\s+(.*)$/);
    if (bulletMatch) {
      // Check if it's nested (starts with tab or multiple spaces)
      const isNested = originalLine.startsWith('\t') || /^\s{2,}/.test(originalLine);
      
      if (!inList || listType !== 'ul') {
        if (inList) processedLines.push(`</${listType}>`);
        processedLines.push('<ul>');
        inList = true;
        listType = 'ul';
      }
      
      // Handle nested lists
      if (isNested) {
        processedLines.push(`<ul><li>${bulletMatch[1]}</li></ul>`);
      } else {
        processedLines.push(`<li>${bulletMatch[1]}</li>`);
      }
      continue;
    }
    
    // Regular line
    if (inList) {
      processedLines.push(`</${listType}>`);
      inList = false;
    }
    
    if (line === '') {
      processedLines.push('<br>');
    } else {
      processedLines.push(`<p>${line}</p>`);
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push(`</${listType}>`);
  }
  
  html = processedLines.join('');
  
  // Convert **bold** to <strong>bold</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  
  // Convert *italic* to <em>italic</em> (but not list markers)
  html = html.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, "<em>$1</em>");
  
  return html;
};
