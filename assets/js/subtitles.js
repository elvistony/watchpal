
// function applySubs(VTTcontent,player){
//     const track = document.createElement('track');
//     document.querySelectorAll('track[kind="captions"]').forEach((trk)=>{
//       player.removeChild(trk);
//     })
//     // Set the track's kind, label, and src attributes
//     track.kind = 'captions';
//     track.label = 'English';
//     track.src = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(srtToVtt(VTTcontent));
//     // console.log('Encoded:',VTTcontent)
//     track.default = true;
//     track.mode='showing';
//     player.appendChild(track);
// }

function applySubs(SRTContent,videojsPlayer){
    document.querySelectorAll('track[kind="captions"]').forEach((trk)=>{
      player.removeChild(trk);
    })
    videojsPlayer.removeRemoteTextTrack(videojsPlayer.textTracks()[0]) 
    videojsPlayer.addRemoteTextTrack({
        kind: "captions",
        label: "English",
        srclang: "en",
        src: 'data:text/vtt;charset=utf-8,' + encodeURIComponent(srtToVtt(SRTContent)),
        showing:true,
        default: true,
    })
}

// function srtToVtt(data) {
//     var srt = data.replace(/\r+/g, '');
//     srt = srt.replace(/^\s+|\s+$/g, '');
//     var cuelist = srt.split('\n\n');
//     var result = "";
//     if (cuelist.length > 0) {
//       result += "WEBVTT\n\n";
//       for (var i = 0; i < cuelist.length; i=i+1) {
//         result += convertSrtCue(cuelist[i]);
//       }
//     }
    
//     return result;
// }

function srtToVtt(srtString) {
    const lines = srtString.split('\n');
    let vttString = 'WEBVTT\n\n';
  
    let currentCue = '';
    lines.forEach(line => {
      if (line.trim() === '') {
        // End of a cue
        vttString += currentCue + '\n';
        currentCue = '';
      } else if (line.match(/^\d+$/)) {
        // Skip the line number
      } else if (line.match(/^\d{2}:\d{2}:\d{2},\d{3} --> \d{2}:\d{2}:\d{2},\d{3}$/)){
        // Timestamp
        currentCue += line.replaceAll(',','.') + '\n';
      }else{
        // text
        currentCue += line + '\n';
      }
    });
  
    return vttString;
  }

function convertSrtCue(caption) {
    var cue = "";
    var s = caption.split(/\n/);
    while (s.length > 3) {
        for (var i = 3; i < s.length; i++) {
            s[2] += "\n" + s[i]
        }
        s.splice(3, s.length - 3);
    }

    var line = 0;
    if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
        cue += s[0].match(/\w+/) + "\n";
        line += 1;
    }
    if (s[line].match(/\d+:\d+:\d+/)) {
        var m = s[1].match(/(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/);
        if (m) {
        cue += m[1]+":"+m[2]+":"+m[3]+"."+m[4]+" --> "
                +m[5]+":"+m[6]+":"+m[7]+"."+m[8]+"\n";
        line += 1;
        } else {
        return "";
        }
    } else {
        return "";
    }

    if (s[line]) {
        cue += s[line] + "\n\n";
    }

    return cue;
}