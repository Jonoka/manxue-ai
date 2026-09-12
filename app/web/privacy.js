// Credentials are transient: visible while editing, masked when blurred, never in browser storage.
const privacy = (() => {
  const values = new WeakMap();
  const mask = value => value.length > 8 ? `${value.slice(0, 3)}****${value.slice(-3)}` : '****';
  function clear(input) { values.set(input, ''); input.value = ''; input.type = 'text'; }
  function bind(root) {
    root.querySelectorAll('[data-secret]').forEach(input => {
      clear(input);
      input.addEventListener('input', () => values.set(input, input.value.trim()));
      input.addEventListener('focus', () => { input.type = 'text'; input.value = values.get(input) || ''; });
      input.addEventListener('blur', () => { const raw = values.get(input); input.value = raw ? mask(raw) : ''; });
    });
  }
  return {bind, clear, read: input => values.get(input) || ''};
})();
