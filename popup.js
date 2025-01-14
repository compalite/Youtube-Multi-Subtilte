
var cur_tab;
var video_title;
var captionTracks;
var translationLanguages;

document.getElementById("div_user_choose").style.display="none";


async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}
getCurrentTab().then(async function(result) {
    cur_tab = result;

    chrome.runtime.sendMessage({
        action : "get_subtitles",
        tabId : cur_tab.id
    });

    
});

chrome.runtime.onMessage.addListener(function(message, sender) {
    if (message.action == "send_subtitles") {
        
        if(message.video_info == null) {
            document.getElementById("div_connecting_tip").innerHTML = "This page has no subtitles!";
            return;
        }
        
        video_title = message.video_info.title;
        captionTracks = message.video_info.captionTracks;
        translationLanguages = message.video_info.translationLanguages;
        parse_video_info();

        document.getElementById("div_connecting_tip").style.display="none";
        document.getElementById("div_user_choose").style.display="block";
        
    }

});

const selector_sub_lang = document.getElementById("selector-sub-lang");
const cbox_trans = document.getElementById("cbox_trans");
const selector_trans_lang = document.getElementById("selector-trans-lang");

const cbox_no_background = document.getElementById("background-transparent-check");
const text_color_choose = document.getElementById("text-color-choose");
const background_color_choose = document.getElementById("background-color-choose");
const text_size_choose = document.getElementById("text-size-choose");


function parse_video_info() {
    
    document.getElementById("div_page_title").textContent = video_title;

    //const selector_sub_lang = document.getElementById("selector-sub-lang");
    selector_sub_lang.innerHTML = "";
    captionTracks.forEach(async function (c, i) {
        let option = document.createElement("option");
        option.setAttribute("value", i);
        
        option.textContent = c.name.simpleText;
        
        selector_sub_lang.appendChild(option);
        chrome.storage.local.get(["orig_sub_lang"]).then ((res) => {
            if (res.orig_sub_lang ==  c.vssId) {
                selector_sub_lang.value = i;
            }
        })
        
    });
    

    //const selector_trans_lang = document.getElementById("selector-trans-lang");
    translationLanguages.forEach(async function (c, i) {
        let option = document.createElement("option");
        option.setAttribute("value", i);
        
        option.textContent = c.languageName.simpleText;
        
        selector_trans_lang.appendChild(option);

        chrome.storage.local.get(["tran_sub_lang"]).then ((res) => {
            if (res.tran_sub_lang == c.languageCode) {
                selector_trans_lang.value = i;
            }
        })
        
    });

    chrome.storage.local.get(["text_color"]).then((res) => {
        if (!res.text_color) return;
        text_color_choose.value = res.text_color;
    });
    chrome.storage.local.get(["background_color"]).then((res) => {
        if (!res.background_color) return;
        if (res.background_color == "transparent") {
            cbox_no_background.checked = true;
            background_color_choose.setAttribute("disabled", "true");
        } else {
            background_color_choose.value = res.background_color;
        }
    });
    chrome.storage.local.get(["text_size"]).then((res) => {
        if (!res.text_size) return;
        text_size_choose.value = res.text_size;
        document.getElementById("size-value").innerHTML = res.text_size;
    })

}


document.getElementById("btn_disp_sub").onclick = function() {
    let background_color_value;
    if (cbox_no_background.checked) {
        background_color_value = "transparent";
    } else {
        background_color_value = background_color_choose.value;
    }

    chrome.runtime.sendMessage({
        action: "display_sub",
        url: get_subtitle_url(),
        tabId : cur_tab.id,
        textColor: text_color_choose.value,
        backgroundColor: background_color_value,
        textSize: text_size_choose.value
    });

    var orig_vssid = captionTracks[selector_sub_lang.value].vssId;
    chrome.storage.local.set({ "orig_sub_lang": orig_vssid });
    
    if ( cbox_trans.checked) {
        var tran_lang = translationLanguages[selector_trans_lang.value].languageCode;
        chrome.storage.local.set({"tran_sub_lang": tran_lang});
    }

    chrome.storage.local.set({ "text_color": text_color_choose.value });
    chrome.storage.local.set({ "background_color": background_color_value });
    chrome.storage.local.set({ "text_size": text_size_choose.value });

};

function get_subtitle_url(){
    const selector_sub_lang = document.getElementById("selector-sub-lang");
    const cbox_trans = document.getElementById("cbox_trans");
    const selector_trans_lang = document.getElementById("selector-trans-lang");
    
    var url = captionTracks[selector_sub_lang.value].baseUrl + "&fmt=vtt";
    
    if (cbox_trans.checked)
    {
        var trans_to_lang_code = translationLanguages[selector_trans_lang.value].languageCode;
        url += `&tlang=${trans_to_lang_code}`;
    }
    return url;
}


document.getElementById("btn_rm_sub").onclick = function() {
    chrome.runtime.sendMessage({
        action: "remove_subs",
        tabId : cur_tab.id
    });
};


cbox_trans.addEventListener("change", function() {
    if (cbox_trans.checked) {
        selector_trans_lang.removeAttribute("disabled");
        selector_sub_lang.setAttribute("disabled", "true");
    }
        
    else {
        selector_trans_lang.setAttribute("disabled", "true");
        selector_sub_lang.removeAttribute("disabled");
    }
        
});

cbox_no_background.addEventListener("change", function() {
    if (cbox_no_background.checked) {
        background_color_choose.setAttribute("disabled", "true");
    } else {
        background_color_choose.removeAttribute("disabled");
    }
        
});

text_size_choose.addEventListener("input", function() {
    document.getElementById("size-value").innerHTML = text_size_choose.value;
        
});