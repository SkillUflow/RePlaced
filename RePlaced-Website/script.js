let posX = 0;

document.onscroll = () => {
  posX = window.scrollY * 1.5;
  document.querySelector(".waveContainer").style.backgroundPositionX = posX + 'px'
}

document.querySelector(".waveContainer").style.backgroundPositionX = posX + 'px'