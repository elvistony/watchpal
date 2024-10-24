const socket = io("https://socket.elvistony.dev");
var roomId = document.location.hash;
roomId = roomId.length>0?roomId:'public'

myContext = {
    timestops:false
}
// var roomId = 'demoroom'

var remoteUI = {
    'context':{
        'mirror':document.querySelector('#mirror-context'),
        'load':document.querySelector('#load-context')
    },
    'video':{
        'streamURL':document.querySelector('#stream-url'),
        'urlTest':document.querySelector('#url-test'),
        'urlApply':document.querySelector('#url-apply'),
        'title':document.querySelector('#video-title'),
        'desc':document.querySelector('#video-desc'),
        'timestops':document.querySelector('#timestops'),
        'apply':document.querySelector("#send-pack-button")
    },
    'subs':{
        'srtURL':document.querySelector('#srt-url'),
        'srtContent':document.querySelector('#srt-content'),
        'srtApply':document.querySelector('#srt-apply')
    },
    'playback':{
        'title':document.querySelector('#playback-title'),
        'desc':document.querySelector('#playback-desc'),
        'play-pause':document.querySelector('#play-pause'),
        'play-pause-icon':document.querySelector('#play-pause-icon'),
        'player':document.querySelector('#player'),
        'seek':{
            'rewind':document.querySelector('#seek-rewind'),
            'forward':document.querySelector('#seek-forward')
        },   
    },
    'peers':{
        'reload':document.querySelector('#peer-reload'),
        'count':document.querySelector('#peer-count')
    }
}




socket.emit('join', roomId);

let selfId;

socket.on('welcome',(data)=>{
    const { from, msg ,room } = data;
    selfId = msg.id;
    console.log('Got ID',selfId);
    remoteUI['player'] = videojs(remoteUI.playback.player);
    buttonHandlers()
    if(msg.context){
        loadContext(msg.context);
        
    }
    remoteUI.peers.count.innerHTML = msg.count;

})

socket.on('roomupdate',(data)=>{
    console.log('roomupdate',data)
    const { from, msg } = data;
    remoteUI.peers.count.innerHTML=msg.count;
})

socket.on('context',(data)=>{
    const {from, context } = data;
    console.log(context);
    loadContext(context);
    myContext.context = context;
})

socket.on('clients',(data)=>{
    console.log(data)
    const {from, clients, count } = data;
    remoteUI.peers.count.innerHTML = count;
})

socket.on('message',(data)=>{
    const { from, msg, room } = data;
    console.log(data)
    
    switch (msg.type) {
        case 'pause':
            remoteUI.player.pause();
            break;
        case 'play':
            remoteUI.player.play();
            break;
        case 'seek':
            if(from==selfId){break;}
            remoteUI.player.currentTime(msg.payload);
            remoteUI.player.pause();
            break;
        case 'src':
            loadSrc(msg.payload)
            break;
        
        case 'srt':
            let VTTcontent = applySubs(msg.payload);
            applySubs(VTTcontent)
            remoteUI.player.removeAttribute('loop');
            remoteUI.player.removeAttribute('autoplay');
            remoteUI.player.load();
            break;
    
        default:
            break;
    }
})


function loadContext(context){
    remoteUI.playback.title.innerHTML=context.title;
    remoteUI.playback.desc.innerHTML=context.desc;
    
    myContext.context = context;

    if(remoteUI.context.mirror.checked){
        remoteUI.video.streamURL.value = context.url;
        remoteUI.video.title.value = context.title;
        remoteUI.video.desc.value = context.desc;
        remoteUI.subs.srtContent.value = context.srtContent;
        remoteUI.video.timestops.value = context.timestops;
    }
    loadSrc(context.url)
    if(context.srtContent!=''){
        loadSrt(context.srtContent)
    }
    
}

function generateTimestamps(videoDuration, numTimestamps) {
    const timestamps = [];
    const interval = videoDuration / (numTimestamps - 1);
    var readableTimestamps = []
    for (let i = 0; i < numTimestamps; i++) {
      const timestamp = i * interval;
      timestamps.push(timestamp);
      readableTimestamps.push(new Date(timestamp * 1000).toISOString().slice(11, 19))
    }
    console.log(readableTimestamps)
    return timestamps;
  }

function loadSrt(content){
    let VTTcontent = applySubs(content,remoteUI.playback.player);
    // applySubs(VTTcontent)
    remoteUI.player.removeAttribute('loop');
    remoteUI.player.removeAttribute('autoplay');
    remoteUI.player.load();
}

function inform(state,data=''){
    var msg = {
        'type':state,
        'payload':data
    }
    socket.emit('message',{from:selfId,msg:msg, room:roomId})
}


remoteUI.playback["play-pause"].addEventListener('click',()=>{
    if(remoteUI.playback.player.paused||remoteUI.playback.player.ended){
        inform('play')
    }else{
        inform('pause')
    }
})

function loadSrc(src){
    remoteUI.player.src({
        src: src,
    });
    remoteUI.player.removeAttribute('loop');
    remoteUI.player.removeAttribute('autoplay');
    remoteUI.player.load();
}


// Button Handlers

function buttonHandlers(){

remoteUI.video.urlApply.addEventListener('click',()=>{inform('src',remoteUI.video.streamURL.value)})
remoteUI.video.urlTest.addEventListener('click',()=>{inform('src',remoteUI.video.streamURL.value)})

remoteUI.context.load.addEventListener('click',()=>{inform('getContext','')})
remoteUI.context.load.addEventListener('click',()=>{inform('srt',remoteUI.subs.srtContent.value)})

remoteUI.video.apply.addEventListener('click',()=>{
    context = {
        'url':remoteUI.video.streamURL.value,
        'title':remoteUI.video.title.value,
        'desc':remoteUI.video.desc.value,
        'srtContent':remoteUI.subs.srtContent.value,
        'timestops':remoteUI.video.timestops.value*1
    }
    socket.emit('storeContext',{
        from: selfId,
        context: context,
        roomId: roomId
    });
})

remoteUI.playback.player.addEventListener('seek', (event) => {
    remoteUI.player.pause();
  });
  

remoteUI.playback.player.addEventListener('seeked',()=>{
    position = remoteUI.playback.player.currentTime;
    console.log('Broadcasting seek position!',position);
    inform('seek',position)
})

remoteUI.playback.player.addEventListener('timeupdate', () => {
    if(myContext.timestops){
        let timestamps = myContext.timestops;
        timestamps.forEach(timestamp => {
            if (Math.abs(remoteUI.playback.player.currentTime - timestamp) < 0.1) { // Adjust the tolerance as needed
                remoteUI.playback.player.pause()
            }
        });
    }
});

remoteUI.playback.player.addEventListener('loadeddata',()=>{
    myContext.timestops = generateTimestamps(remoteUI.playback.player.duration,myContext.context.timestops)
    // console.log(myContext.timestops)
})



}

remoteUI.peers.reload.addEventListener('click',()=>{socket.emit('peers',{from:selfId,room:roomId})})

// document.querySelector('#apply').addEventListener('click',()=>{
//     inform('src',document.querySelector('#url').value)
// })

// document.querySelector('#srt-content').addEventListener('click',()=>{
//     inform('srt',document.querySelector('#url').value)
// })