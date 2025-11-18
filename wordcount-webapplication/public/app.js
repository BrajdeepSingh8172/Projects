// app.js - Enhanced Word Count Analytics
(function() {
  'use strict';

  // DOM Elements
  const textarea = document.getElementById('text');
  const countBtn = document.getElementById('countBtn');
  const clearBtn = document.getElementById('clearBtn');
  const copyBtn = document.getElementById('copyBtn');

  // Stats Elements
  const wordCountEl = document.getElementById('wordCount');
  const charCountEl = document.getElementById('charCount');
  const spaceCountEl = document.getElementById('spaceCount');
  const sentenceCountEl = document.getElementById('sentenceCount');
  const avgLengthEl = document.getElementById('avgLength');
  const paragraphCountEl = document.getElementById('paragraphCount');

  // Unicode-aware word matching
  function countWords(text) {
    if (!text) return 0;
    try {
      const matches = text.match(/\p{L}[\p{L}'-]*/gu);
      return matches ? matches.length : 0;
    } catch (e) {
      // Fallback for non-Unicode regex support
      const words = text.trim().split(/\s+/).filter(Boolean);
      return words.length;
    }
  }

  function countSentences(text) {
    if (!text) return 0;
    const sentences = text.match(/[.!?]+/g);
    return sentences ? sentences.length : 0;
  }

  function countParagraphs(text) {
    if (!text) return 0;
    const paragraphs = text.trim().split(/\n\n+/).filter(Boolean);
    return paragraphs.length;
  }

  function getAverageWordLength(text, wordCount) {
    if (wordCount === 0) return 0;
    const cleanText = text.replace(/\s+/g, '');
    return (cleanText.length / wordCount).toFixed(1);
  }

  function updateStats() {
    const text = textarea.value || '';
    const words = countWords(text);
    const chars = text.length;
    const spaces = (text.match(/\s/g) || []).length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);
    const avgLength = getAverageWordLength(text, words);

    // Update display with animation
    animateCounter(wordCountEl, words);
    animateCounter(charCountEl, chars);
    animateCounter(spaceCountEl, spaces);
    animateCounter(sentenceCountEl, sentences);
    animateCounter(paragraphCountEl, paragraphs);
    avgLengthEl.textContent = avgLength;
  }

  function animateCounter(element, newValue) {
    const oldValue = parseInt(element.textContent, 10);
    if (oldValue !== newValue) {
      element.style.opacity = '0.7';
      element.textContent = newValue;
      setTimeout(() => {
        element.style.opacity = '1';
      }, 50);
    }
  }

  // Event Listeners
  countBtn.addEventListener('click', updateStats);
  
  clearBtn.addEventListener('click', () => {
    textarea.value = '';
    textarea.focus();
    updateStats();
  });

  copyBtn.addEventListener('click', () => {
    const stats = `Word Count: ${wordCountEl.textContent}\nCharacters: ${charCountEl.textContent}\nSpaces: ${spaceCountEl.textContent}\nSentences: ${sentenceCountEl.textContent}\nParagraphs: ${paragraphCountEl.textContent}\nAvg Word Length: ${avgLengthEl.textContent}`;
    navigator.clipboard.writeText(stats).then(() => {
      copyBtn.textContent = '✓ Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = '<span>Copy Stats</span>';
      }, 2000);
    }).catch(err => console.error('Failed to copy:', err));
  });

  // Live update (debounced)
  let timer = null;
  textarea.addEventListener('input', () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      updateStats();
      timer = null;
    }, 150);
  });

  // Initialize stats on page load
  updateStats();

  // Smooth transitions for stats
  document.querySelectorAll('.stat-value').forEach(el => {
    el.style.transition = 'all 0.3s ease';
  });
})();
