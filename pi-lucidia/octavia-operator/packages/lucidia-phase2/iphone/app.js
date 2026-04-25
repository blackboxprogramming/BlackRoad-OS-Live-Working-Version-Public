document.getElementById('approve').onclick = () => {
  fetch('/approve', { method: 'POST' })
    .then(() => alert('Execution approved'))
    .catch(() => alert('Failed to approve'));
};

document.getElementById('block').onclick = () => {
  fetch('/block', { method: 'POST' })
    .then(() => alert('Execution blocked'))
    .catch(() => alert('Failed to block'));
};
