document.querySelectorAll('.dropdown-button').forEach(button => {
  button.addEventListener('click', () => {
     const content = button.nextElementSibling;
    const isOpen = content.style.display === 'block';
     content.style.display = isOpen ? 'none' : 'block';
    button.classList.toggle('active', !isOpen);   
  });
});