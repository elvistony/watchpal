document.getElementById('dailymotionSource').addEventListener('click',()=>{
    var dailymotionVideo = prompt('Enter Dailymotion URL');
    var dailyID = dailymotionVideo.split('dailymotion.com/video/')[1]
    const dailymotionapi = "https://corsproxy.io/?https://www.dailymotion.com/player/metadata/video/<VIDEOID>?embedder="
    getText(dailymotionapi.replace('<VIDEOID>',dailyID));
    async function getText(file) {
        let x = await fetch(file);
        let y = await x.text();
        let js = await JSON.parse(y);
        console.log(js);
        document.getElementById('VideoURL').value = 'https://corsproxy.io/?'+ js['qualities']['auto'][0]['url'];
    }
})




function downloadDailySubs(){

}

function openVideoInNewTab(url) {
    // Create a new window for the video
    const newWindow = window.open("", "_blank");
  
    // Create a video element in the new window
    const video = document.createElement("video");
    video.src = url;
    video.controls = true;
    video.style.width = "100%";
    video.style.height = "100%";

  
    // Create a button to close the tab
    const closeButton = document.createElement("button");
    closeButton.textContent = "Close Tab";
    closeButton.onclick = () => {
      newWindow.close();
    };
  
    // Add the video and button to the new window's body
    newWindow.document.body.appendChild(video);
    newWindow.document.body.appendChild(closeButton);
  
    // Play the video automatically
    video.play();
  }

document.getElementById('previewSource').addEventListener('click',()=>{
    openVideoInNewTab(document.getElementById('VideoURL').value);
})