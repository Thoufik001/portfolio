import React from "react";

// Wrap React-owned text, rather than mutating text nodes after React renders.
// Fixed-color project evidence and the physical paper form keep their own ink.
const excludedTags = new Set(['svg', 'input', 'textarea', 'select', 'option', 'style', 'script', 'canvas']);
const excludedClass = /(?:^|\s)(?:sky-clinical|sky-notch-preview|sky-study-scene|sky-project-mark|sky-contact-note|sky-note-content|sky-ai-brand|sky-ink-run)(?:\s|$)/;
export function withSkyInk(node) {
  if (typeof node === 'string' || typeof node === 'number') {
    if (!String(node).trim()) return node;
    return React.createElement('span', { className: 'sky-ink-run' }, node);
  }
  if (Array.isArray(node)) return React.Children.map(node, withSkyInk);
  if (!React.isValidElement(node) || excludedTags.has(node.type) || excludedClass.test(node.props.className || '')) return node;
  if (node.props.children === undefined) return node;
  return React.cloneElement(node, undefined, withSkyInk(node.props.children));
}
