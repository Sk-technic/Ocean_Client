import emojiRegex from "emoji-regex";

/**
 * Escape HTML to prevent injection attacks.
 */
const escapeHtml = (unsafe: string) =>
  unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

/**
 * Render emojis inline using Google-style font (Noto Color Emoji).
 * Keeps all emojis in one line and styled properly.
 */
export const renderWithEmoji = (text: string) => {
  if (!text) return { __html: "" };

  const regex = emojiRegex();
  const escaped = escapeHtml(text);

  // Wrap each emoji in a span for styling consistency
  const html = escaped.replace(regex, (match) => {
    return `<span class="emoji-span">${match}</span>`;
  });

  return { __html: html };
};

/**
 * Detect if a string contains only emojis (with optional whitespace).
 */
export const isEmojiOnly = (text: string): boolean => {
  if (!text) return false;
  const trimmed = text.trim();
  const emojiOnlyRegex =
    /^(?:\s*(?:\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F|\uFE0E)?)*|\p{Emoji_Modifier_Base}\p{Emoji_Modifier}?)\s*)+$/u;
  return emojiOnlyRegex.test(trimmed);
};
