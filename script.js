
// Background Slideshow from Google Sheet
const heroSection = document.querySelector('.hero-section');
let currentBg = 0;
let bgImages = [];

function changeHeroBackground() {
  if (bgImages.length === 0) return;
  currentBg = (currentBg + 1) % bgImages.length;
  heroSection.style.backgroundImage = `url('${bgImages[currentBg]}')`;
  heroSection.classList.add('fade-bg');
  setTimeout(() => {
    heroSection.classList.remove('fade-bg');
  }, 800);
}

function fetchBackgroundImages() {
  fetch("https://script.google.com/macros/s/AKfycbzjznhuiNtZh0AJL0rUY4NFzfoVHpbn61tON8Fh-db-BwkvgNFR3ahBRLH_dEwLjU5IsQ/exec")
    .then(res => res.json())
    .then(data => {
      bgImages = data;
      if (bgImages.length > 0) {
        heroSection.style.backgroundImage = `url('${bgImages[0]}')`;
        setInterval(changeHeroBackground, 3500); // 3.5 seconds
      }
    })
    .catch(err => {
      console.error("Image fetch failed:", err);
    });
}

fetchBackgroundImages();
