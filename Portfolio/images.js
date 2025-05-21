document.addEventListener('DOMContentLoaded', () => {
  const imageGroups = { 
    W2: [
      'account_mobile/Accountmobile1.png',
      'account_mobile/Accountmobile2.png',
      'account_mobile/Accountmobile3.png',
      'Account_pagina_desktop/acountdesktop1.png',
      'Account_pagina_desktop/accountdesktop2.png',
      'Account_pagina_desktop/accountdesktop3.png',
      'Burger_zoo_mobile/mainmobile1.png'
    ],
    W5: [
      
      'W5/verbeterplan CC.png',
      'W5/stappeplan Fout E9 .png',
      'W5/Fout E17.png',
      'W5/stappeplan E17.png',
      'W5/Fout E26.png',
      'W5/stappeplan E26.png',
      'W5/stappeplan E26 2.png',
      'W5/CC verbeterPlanning.png'

    ]
  };

  // Per groep bijhouden waar we zitten
  const currentIndexes = {};
  for (const group in imageGroups) {
    currentIndexes[group] = 0;
  }

 // Toon/verberg groepen
document.querySelectorAll('.toggleGroup').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.getAttribute('data-target');
    const selectedGroup = document.getElementById(target);

    if (!selectedGroup) return;

    const isVisible = !selectedGroup.classList.contains('hidden');

    // Verberg alle groepen
    document.querySelectorAll('.imageGroup').forEach(groupDiv => {
      groupDiv.classList.add('hidden');
    });

    // Alleen tonen als hij nog niet zichtbaar was
    if (!isVisible) {
      selectedGroup.classList.remove('hidden');

      // Reset afbeelding naar eerste in groep
      const img = document.getElementById(`${target}Image`);
      if (img && imageGroups[target]) {
        img.src = imageGroups[target][0];
        currentIndexes[target] = 0;
      }
    }
  });
});

 
  // Volgende / vorige knoppen
  document.querySelectorAll('.prevBtn, .nextBtn').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.getAttribute('data-group');
      const images = imageGroups[group];
      if (!images || images.length === 0) return;

      const imgElement = document.getElementById(`${group}Image`);
      if (!imgElement) return;

      if (button.classList.contains('prevBtn')) {
        currentIndexes[group] = (currentIndexes[group] - 1 + images.length) % images.length;
      } else {
        currentIndexes[group] = (currentIndexes[group] + 1) % images.length;
      }

      imgElement.src = images[currentIndexes[group]];
    });
  });
});