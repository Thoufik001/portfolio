const EMAIL = "thoufikabdullah3360@gmail.com";
export function emailDraft({ name, email, message }) {
  return `mailto:${EMAIL}?subject=${encodeURIComponent(`A note from ${name.trim()}`)}&body=${encodeURIComponent(`${message.trim()}\n\n${name.trim()}\n${email.trim()}`)}`;
}

