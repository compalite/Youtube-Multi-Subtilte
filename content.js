
export default {
    get_video_info,
    add_sub,
    remove_subs,
    addListener
}


async function add_sub(message) {
    let url = message.url;
    let textColor = message.textColor;
    let backgroundColor = message.backgroundColor;
    let textSize = message.textSize;

    let video = document.getElementsByTagName("video")[0];
    let subt = document.createElement("track");
    subt.default = true;
            
    let sub_data;
    await fetch(url).then(response => response.text()).then(textString => {
        sub_data = textString;
    });
    sub_data = sub_data.replaceAll("align:start position:0%", "");
    style = "WEBVTT\nSTYLE\n::cue{background-color: " + backgroundColor + "; color: " + textColor + "; font-size:" + textSize + "px;}";
    //console.log(style);
    
    sub_data = sub_data.replaceAll("WEBVTT", style);
    subt.src = "data:text/vtt," + encodeURIComponent(sub_data, true);
    
    video.appendChild(subt);
    subt.track.mode = "showing";
}

function get_video_info() {
    
    //console.log(document.title);
    try {
        const video_info = document.getElementsByTagName("ytd-app")[0].data.playerResponse;
        let send_info = {
            title : video_info.videoDetails.title,
            captionTracks : video_info.captions.playerCaptionsTracklistRenderer.captionTracks,
            translationLanguages : video_info.captions.playerCaptionsTracklistRenderer.translationLanguages
        }
        
        //console.log(send_info);

        return send_info;
    }catch(err) {}
}

function addListener() {
    if (!document.listeners_have_added) {
        //video.addEventListener("ended", removeTracks);
        //video.addEventListener("pause", hideTracks);
        //video.addEventListener("play", showTracks);
        const next_button = document.getElementsByClassName("ytp-next-button")[0];
        next_button.addEventListener("click", removeTracks);
        
        const video_info = document.getElementsByTagName("ytd-app")[0];
        const video_ads = document.getElementsByClassName("video-ads")[0];
        var observer = new MutationObserver(function(mutationList, observer) {
            mutationList.forEach((mutation) => {
              switch (mutation.type) {
                case "childList":
                    if (mutation.addedNodes.length) {
                        hideTracks();
                    } else if (mutation.removedNodes.length) {
                        showTracks();
                    }
                    break;
                case "attributes":
                    //console.log("this is" + mutation.attributeName);
                        
                    if (mutation.attributeName == "mini-guide-visible") {
                        removeTracks();
                    }
                    break;
                }
            });
        });
        
        var observerOptions1 = {
            childList: true
        };
        var observerOptions2 = {
            attributes: true
        };
        observer.observe(video_ads, observerOptions1);
        observer.observe(video_info, observerOptions2);

        document.listeners_have_added = true;
    }

    function removeTracks() {
        let video = document.getElementsByTagName("video")[0];
        Array.from( video.getElementsByTagName("track") ).forEach( function(ele) {
            ele.track.mode = "hidden";
            ele.parentNode.removeChild(ele);
        });
    }

    function hideTracks() {
        let video = document.getElementsByTagName("video")[0];
        Array.from( video.getElementsByTagName("track") ).forEach( function(ele) {
            ele.track.mode = "hidden";
        });
    }

    function showTracks() {
        let video = document.getElementsByTagName("video")[0];
        Array.from( video.getElementsByTagName("track") ).forEach( function(ele) {
            ele.track.mode = "showing";
        });
    }
}

function remove_subs() {
    let video = document.getElementsByTagName("video")[0];
    Array.from( video.getElementsByTagName("track") ).forEach( function(ele) {
        ele.track.mode = "hidden";
        ele.parentNode.removeChild(ele);
    });
}