const playlist = [{
  name: 'forest-lullaby-110624.mp3',
  band: "Lesfm",
  cover: 'cover-2.png'
},
{
  name: 'lost-in-city-lights-145038.mp3',
  band: 'Cosmo Sheldrake',
  cover: 'cover-1.png'
}];

const audioContext = new AudioContext()
let audioSource = null
let isPlaying = false
let currentTrackIndex = 0
let startTime = 0
let pauseTime = 0
let audioBuffer = null

let animationFrameId = null

let currentTime = 0

let duration = 0
let progress = 0


const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? '0' : ''}${secs}`
}

const setSongName = () => {
  const nameSong = document.getElementById('song-title').children[0]
  const nameBand = document.getElementById('band-name').children[0]
  const coverSong = document.getElementById('song-cover')

  const fileName = playlist[currentTrackIndex].name
  const fileBand = playlist[currentTrackIndex].band

  const nameParts = fileName.split('.')[0].split("/")[1].split('-')

  nameParts.pop();

  const formattedName = nameParts
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

  nameSong.innerHTML = formattedName
  nameBand.innerHTML = fileBand
  coverSong.src = playlist[currentTrackIndex].cover

}

const updateProgressBar = () => {
  const progressBar = document.getElementById('player-progress-bar')
  const currentTimeDisplay = document.getElementById('current-time')
  const durationDisplay = document.getElementById('duration-time')


  if (isPlaying && audioSource && audioBuffer) {
    currentTime = pauseTime + (audioContext.currentTime - startTime)

    duration = audioBuffer.duration;
    progress = (currentTime / duration) * 100;
    progressBar.value = Math.min(progress, 100)

    currentTimeDisplay.textContent = formatTime(currentTime)

    durationDisplay.textContent = formatTime(duration)

    animationFrameId = requestAnimationFrame(updateProgressBar)
    setSongName()
  }
}

setSongName()

const toggleAudio = async (audioFile) => {

  if (!isPlaying) {
    if (!audioBuffer) {
      const response = await fetch(audioFile)
      const arrayBuffer = await response.arrayBuffer()
      audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    }
    audioSource = audioContext.createBufferSource()
    audioSource.buffer = audioBuffer
    audioSource.connect(audioContext.destination)

    startTime = audioContext.currentTime
    audioSource.start(0, pauseTime)
    isPlaying = true

    toggleButton.innerHTML = '<img src="pause-40.svg" alt="Pause">'
    updateProgressBar()

  } else {
    pauseTime = pauseTime + (audioContext.currentTime - startTime)
    audioSource.stop()
    isPlaying = false
    (pauseTime > 0) ? toggleButton.innerHTML = '<img src="Play_fill.svg" alt="Play">' : toggleButton.innerHTML = '<img src="stop.svg" alt="Stop">'

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId)
    }
  }
}


const playNext = () => {
  if (audioSource) audioSource.stop()

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }

  currentTrackIndex = (currentTrackIndex + 1) % playlist.length
  isPlaying = false
  pauseTime = 0
  audioBuffer = null
  toggleAudio(playlist[currentTrackIndex].name)
}


const  playPrevious = () => {
  if (audioSource) audioSource.stop()

  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
  currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length
  isPlaying = false;
  pauseTime = 0
  audioBuffer = null
  toggleAudio(playlist[currentTrackIndex].name)
}

const toggleButton = document.getElementById('play-and-stop')
const backButton = document.getElementById('back')
const nextButton = document.getElementById('next')
const initialTime = document.getElementById('current-time')

toggleButton.innerHTML = '<img src="Play_fill.svg" alt="Play">'
backButton.innerHTML = '<img src="Stop_and_play_fill-1.svg" alt="back">'
nextButton.innerHTML = '<img src="Stop_and_play_fill.svg" alt="next">'

initialTime.innerHTML = currentTime.toFixed(2)

toggleButton.addEventListener('click', () => toggleAudio(playlist[currentTrackIndex].name))
nextButton.addEventListener('click', playNext)
backButton.addEventListener('click', playPrevious)