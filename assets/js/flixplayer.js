const video = document.getElementById('video-player');
const controlsOverlay = document.getElementById('controlsOverlay');
const playPauseBtn = document.getElementById('play-pause');
const playPauseIcon = document.getElementById('playPauseIcon');
const progressBar = document.querySelector('.progress-bar');
const startTimeElement = document.querySelector('#startTime');
const endTimeElement = document.querySelector('#endTime');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const rewindBtn = document.getElementById('seek-rewind');
const forwardBtn = document.getElementById('seek-forward');
let hideControlsTimeout;

// Play/Pause functionality
// playPauseBtn.addEventListener('click', () => {
//     if (video.paused) {
//         video.play();
//         if (!document.fullscreenElement) {
//             document.body.requestFullscreen();
//         }
//         playPauseIcon.classList.remove('fa-play');
//         playPauseIcon.classList.add('fa-pause');
//     } else {
//         video.pause();
//         playPauseIcon.classList.remove('fa-pause');
//         playPauseIcon.classList.add('fa-play');
//     }
// });

// Fullscreen functionality
fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.body.requestFullscreen();
        fullscreenIcon.classList.remove('fa-compress');
        fullscreenIcon.classList.add('fa-expand');
    } else {
        document.exitFullscreen();
        fullscreenIcon.classList.remove('fa-expand');
        fullscreenIcon.classList.add('fa-compress');
    }
});

// Auto-hide controls after 3 seconds
function hideControls() {
    controlsOverlay.classList.add('hide-controls');
    // rewindBtn.classList.add('hide-controls');
    // forwardBtn.classList.add('hide-controls');
    playPauseIcon.focus();
}

function showControls(duration=5000) {
    controlsOverlay.classList.remove('hide-controls');
    // rewindBtn.classList.remove('hide-controls');
    // forwardBtn.classList.remove('hide-controls');
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(hideControls,duration );
}

// controlsOverlay.addEventListener('mouseover',()=>{showControls()})

// Show controls on mouse move
document.addEventListener('mousemove', ()=>{showControls()});


// Initially start the timer to auto-hide controls
video.addEventListener('play', () => {
    hideControlsTimeout = setTimeout(hideControls, 5000);
    playPauseIcon.classList.remove('fa-play');
    playPauseIcon.classList.add('fa-pause');
});

// Reset auto-hide timer when video is paused
video.addEventListener('pause', ()=>{
    showControls(); 
    playPauseIcon.classList.add('fa-play');
    playPauseIcon.classList.remove('fa-pause');
});

// Reset auto-hide timer when video is paused
video.addEventListener('canplay', ()=>{
    showControls(); 
    playPauseIcon.classList.add('fa-play');
    playPauseIcon.classList.remove('fa-pause');
    progressBarUpdate()
});

//// Rewind 10 seconds
// rewindBtn.addEventListener('click', () => {
//     video.pause()
//     video.currentTime = Math.max(0, video.currentTime - 10);
// });

// // Forward 10 seconds
// forwardBtn.addEventListener('click', () => {
//     video.pause()
//     video.currentTime = Math.min(video.duration, video.currentTime + 10);
// });

playPauseBtn.addEventListener('focus',()=>{showControls()})
fullscreenBtn.addEventListener('focus',()=>{showControls()})
rewindBtn.addEventListener('focus',()=>{showControls()})
forwardBtn.addEventListener('focus',()=>{showControls()})

document.addEventListener('keydown', (event) => {
    if ((event.key === 'ArrowRight') || (event.key === 'ArrowLeft') || (event.key === 'ArrowUp') || (event.key === 'ArrowDown')) {
        showControls(); 
    }
});

document.querySelector('.start-button').focus();
document.querySelector('.start-button').addEventListener('click',()=>{
    if (!document.fullscreenElement) {
        document.body.requestFullscreen();
        fullscreenIcon.classList.remove('fa-compress');
        fullscreenIcon.classList.add('fa-expand');
    } else {
        document.exitFullscreen();
        fullscreenIcon.classList.remove('fa-expand');
        fullscreenIcon.classList.add('fa-compress');
    }
})

video.addEventListener('timeupdate', () => {
    // Get the video duration in seconds
    progressBarUpdate()
});

function progressBarUpdate(){
    const videoDuration = video.duration;
    // Calculate the current progress
    const progress = (video.currentTime / videoDuration) * 100;

    // Update the progress bar
    progressBar.style.width = `${progress}%`;

    // Update the start time
    const currentTime = new Date(video.currentTime * 1000);
    startTimeElement.textContent = currentTime.toISOString().substr(11, 8);

    // Update the end time (if needed)
    if (videoDuration > 0) {
        const endTime = new Date(videoDuration * 1000);
        endTimeElement.textContent = endTime.toISOString().substr(11, 8);
    }
}