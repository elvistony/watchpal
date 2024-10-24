var roomId = document.location.hash;
roomId = roomId.length>0?roomId:'public'
// var roomId = 'demoroom'
let socket;
let selfId = '';
// let myContext.ready = false;
let myContext = {
    ready:false,
    srcSet:false,
    selfId: '',
    context: false
}

positions = [];

let PlayerUI = {
    'readyButton':document.querySelector('#ready-button'),
    'videoTitle':document.querySelector('#video-title'),
    'videoDesc':document.querySelector('#video-desc'),
    'viewerCount':document.querySelector('#viewer-count'),
    'roomCode':document.querySelector("#room-code"),
    'clientId':document.querySelector("#client-id"),
    'middleControls':document.querySelector('.middle-controls'),
    'progressbar':document.querySelector('.progress-bar'),
    'timestop':document.querySelector('#timestops-enabled'),
    'reloadPack':document.querySelector('#reload-package'),
    'syncOthers':document.querySelector('#sync-others'),
    'video':document.querySelector('#video-player'),
    'seeking':{
        'forward':document.querySelector('#seek-forward'),
        'rewind':document.querySelector('#seek-rewind')
    },
    'playpause':document.querySelector('#play-pause')
}

PlayerUI['player'] = videojs(PlayerUI.video);


function JoinRoom(){
    socket = io("https://socket.elvistony.dev");
    // socket.connect();
    socket.emit('join', roomId);
    
    PlayerUI.roomCode.innerHTML=roomId;
    if(!myContext.srcSet){PlayerUI.player.play()}
    // PlayerUI.
    SocketHandlers()
    VideoUiHandlers()
}

PlayerUI.readyButton.addEventListener('click',()=>{
    JoinRoom();
    document.querySelector('.start-container').style.display='none';
    myContext.ready=true;
    
    PlayerUI.playpause.focus()
    // PlayerUI.player.fill(true)
    // PlayerUI.player.load();
    PlayerUI.player.play();
})

function inform(state,data=''){
    var msg = {
        'type':state,
        'payload':data
    }
    socket.emit('message',{from:selfId,msg:msg, room:roomId})
}

function loadContext(context){
    PlayerUI.videoTitle.innerHTML=context.title;
    PlayerUI.videoDesc.innerHTML=context.desc;
    loadSrc(context.url);
    if(context.srtContent!=''){
        loadSrt(context.srtContent);
    }
    myContext.context = context;
    console.log(context)
    ToastMessage('success','Loaded Context')    
}

function averagePositionPolls(timestamps){
    let sum = 0;
    let count = 0;
    const deviation = 5;
    const average = sum / count;
    for (let i = 0; i < timestamps.length; i++) {
        if (Math.abs(timestamps[i] - average) <= deviation) {
        sum += timestamps[i];
        count++;
        }
    }
    return sum / count;
}

function ToastMessage(type,message){
    Toastify({
        text: message,
        duration: 5000,
        close: true,
        className: `toast-${type}`,
        gravity: "top", // `top` or `bottom`
        position: "center", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        onClick: function(){} // Callback after click
      }).showToast();
}


function loadSrt(content){
    let VTTcontent = applySubs(content,PlayerUI.video);
    PlayerUI.player.removeAttribute('loop');
    PlayerUI.player.removeAttribute('autoplay');
    // PlayerUI.player.load();
}

function SocketHandlers(){

    socket.on('welcome',(data)=>{
        console.log('welcome',data)
        const { from, msg ,room } = data;
        selfId = msg.id;
        console.log('Got ID',selfId);
        PlayerUI.clientId.innerHTML=selfId;
        PlayerUI.viewerCount.innerHTML=msg.count;

        if(msg.context){
            loadContext(msg.context)
        }

    })

    socket.on('context',(data)=>{
        const {from, context } = data;
        console.log(context);
        loadContext(context);
    
    })

    socket.on('roomupdate',(data)=>{
        console.log('roomupdate',data)
        const { from, msg } = data;
        PlayerUI.viewerCount.innerHTML=msg.count;
        if(myContext.srcSet){
            inform('position-poll',PlayerUI.player.currentTime())
        }
    })

    socket.on('message',(data)=>{
        const { from, msg, room } = data;
        console.log(data)
        
        switch (msg.type) {
            case 'pause':
                PlayerUI.video.pause();
                ToastMessage('success','Someone pressed Pause')  
                break;
            case 'play':
                PlayerUI.video.play();
                ToastMessage('success','Someone pressed Play')  
                break;
            case 'position-poll':
                if(from==selfId){break;}
                console.log("Position Poll:",msg.payload)
                break;
            case 'seek':
                PlayerUI.video.currentTime = msg.payload;
                PlayerUI.video.pause();
                ToastMessage('success','Someone seeked the stream')  
                break;
            case 'src':
                loadSrc(msg.payload)
                break;
            
            case 'srt':
                loadSrt(msg.payload)
                break;
        
            default:
                break;
        }
    })

    // socket.on("connect", () => {
    //     selfId = socket.id;
    //     console.log('Connected!')
    //     if(myContext.ready){
    //         // socket.emit('join', roomId);
    //         console.log('Rejoining !')
    //     }
    // });

    socket.on("connect_refused", (error) => {
        if (socket.active) {
          // temporary failure, the socket will automatically try to reconnect
          console.log('Temporary Failure')
          socket.emit('join', roomId);
          selfId = socket.id;
        } else {
          // the connection was denied by the server
          // in that case, `socket.connect()` must be manually called in order to reconnect
          PlayerUI.viewerCount.innerHTML='OFFLINE';
          console.log("erorrr",error.message);

        }
      });

    socket.on("disconnect", () => {
        PlayerUI.viewerCount.innerHTML='OFFLINE';
    });

}


function loadSrc(src){
    PlayerUI.player.src({
        src: src,
    });
    PlayerUI.middleControls.classList.remove('hide')
    PlayerUI.progressbar.style.width=0;
    PlayerUI.player.removeAttribute('loop');
    PlayerUI.player.removeAttribute('autoplay');
    PlayerUI.player.load();
    myContext.srcSet=true;
}


function generateTimestamps(videoDuration, numTimestamps) {
    
    const timestamps = [];
    const interval = videoDuration / (numTimestamps - 1);
    console.log("Generating: ",videoDuration,timestamps)
    var readableTimestamps = []
    for (let i = 0; i < numTimestamps; i++) {
      const timestamp = i * interval;
      timestamps.push(timestamp);
      readableTimestamps.push(new Date(timestamp * 1000).toISOString().slice(11, 19))
    }
    console.log("Timestamps:`",numTimestamps,readableTimestamps)
    return timestamps;
  }


function VideoUiHandlers(){
    
    PlayerUI.playpause.addEventListener('click',()=>{
        if(!myContext.srcSet){
            if(PlayerUI.video.paused || PlayerUI.video.ended){
                PlayerUI.player.play()
            }else{
                PlayerUI.player.pause()
            }
            return; 
        }
        if(!(PlayerUI.video.paused || PlayerUI.video.ended)){
            inform('pause')
        }else{
            inform('play')
        }
    })

    PlayerUI.syncOthers.addEventListener('click',()=>{
        inform('seek',data=PlayerUI.video.currentTime);
    })

    PlayerUI.seeking.rewind.addEventListener('click',()=>{
        inform('seek',data=PlayerUI.video.currentTime-10);
    })

    PlayerUI.seeking.forward.addEventListener('click',()=>{
        inform('seek',data=PlayerUI.video.currentTime+10);
    })

    PlayerUI.timestop.addEventListener('click',()=>{
        if(PlayerUI.timestop.classList.contains('enabled')){
            PlayerUI.timestop.classList.remove('enabled')
        }else{
            PlayerUI.timestop.classList.add('enabled')
        }
    })

    PlayerUI.player.on('timeupdate', () => {
        // if(!PlayerUI.timestop.classList.contains('enabled')){return}
        if(myContext.timestops){
            let timestamps = myContext.timestops;
            timestamps.forEach(timestamp => {
                if (Math.abs(PlayerUI.player.currentTime() - timestamp) < 0.1) { // Adjust the tolerance as needed
                    PlayerUI.player.pause()
                    ToastMessage('warning','Scheduled Stop Encountered')
                }
            });
        }
    });

    PlayerUI.player.on('loadeddata', () => {
        myContext['timestops'] = generateTimestamps(PlayerUI.player.duration(), myContext.context.timestops)
        inform('canplay')
    });

}