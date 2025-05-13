// Get the button and the text element
const button = document.getElementById('revealButton');
const text = document.getElementById('text');

// Add an event listener to the button to toggle visibility
button.addEventListener('click', () => {
  text.classList.toggle('hidden');  // Toggle the 'hidden' class on the text element
  if (text.classList.contains('hidden')) {
    button.textContent = 'Show Text';  // Change button text when hidden
  } else {
    button.textContent = 'Hide Text';  // Change button text when visible
  }
});