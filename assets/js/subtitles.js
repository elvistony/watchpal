
function applySubs(VTTcontent,player){
    const track = document.createElement('track');
    document.querySelectorAll('track[kind="captions"]').forEach((trk)=>{
      player.removeChild(trk);
    })
    // Set the track's kind, label, and src attributes
    track.kind = 'captions';
    track.label = 'English';
    track.src = 'data:text/vtt;charset=utf-8,' + encodeURIComponent(VTTcontent);
    track.default = true;
    player.appendChild(track);
}


function srtToVtt(data) {
    var srt = data.replace(/\r+/g, '');
    srt = srt.replace(/^\s+|\s+$/g, '');
    var cuelist = srt.split('\n\n');
    var result = "";
    if (cuelist.length > 0) {
      result += "WEBVTT\n\n";
      for (var i = 0; i < cuelist.length; i=i+1) {
        result += convertSrtCue(cuelist[i]);
      }
    }
  
    return result;
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