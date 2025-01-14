import injectionFunc from './content.js';
const ytb = "://www.youtube.com/watch";
var tabId;
var video_info;

chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: 'OFF'
    });
});


chrome.tabs.onActivated.addListener(async (activeInfo) => {
    //console.log(activeInfo);
    chrome.tabs.get(activeInfo.tabId, (tab) => {
        //console.log(tab);
        judgeTab(tab);
    })
    
});

chrome.tabs.onUpdated.addListener(async function(tabId, changeInfo, tab) {
    //console.log(tab);
    judgeTab(tab);
    
  });

function judgeTab(tab) {
    if (tab.url.includes(ytb)) {

        enableExtension(tab.id);
        tabId = tab.id;

    } else {
        disableExtension(tab.id);
      }
}

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.action == "get_subtitles") {
        get_subtitles(message);
    } else if (message.action == "display_sub") {
        show_subtiltes(message);
    } else if (message.action == "remove_subs") {
        clean_subs(message);
    }
});

function show_subtiltes(message) {
    //console.log(message);
    chrome.scripting.executeScript({
        target : {tabId : message.tabId},
        func : injectionFunc.addListener,
        world : "MAIN",
    })

    chrome.scripting.executeScript({
        target : {tabId : message.tabId},
        func : injectionFunc.add_sub,
        args: [message],
        world : "MAIN",
    })
    
}

function clean_subs(message) {
    chrome.scripting.executeScript({
        target : {tabId : message.tabId},
        func : injectionFunc.remove_subs,
        world : "MAIN",
    })
}

function get_subtitles(message) {
    chrome.scripting.executeScript({
        target : {tabId : message.tabId},
        func : injectionFunc.get_video_info,
        world : "MAIN",
    }).then((injectionResults) => {
        //console.log(injectionResults[0].result);
        video_info = injectionResults[0].result;
        chrome.runtime.sendMessage({
            action : "send_subtitles",
            video_info : video_info
        })
    })
}


function enableExtension(tabId) {
    chrome.action.setBadgeText({
        text: 'OK'
    });
    chrome.action.enable(tabId);
}

function disableExtension(tabId) {
    chrome.action.setBadgeText({
        text: 'OFF'
    });
    chrome.action.disable(tabId);
}