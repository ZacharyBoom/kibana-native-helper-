// @name         kibana-helper
// @namespace    https://gist.github.com/Rychou/bd89375c895b05518ef8eafe7fd26bda
// @version      0.10.22
// @description
// @author       You
// @include        http://esa.kibana.qcloud.com/app/kibana
// @include        http://es-ioknxgy0.internal.kibana.tencentelasticsearch.com/app/kibana
// @require https://unpkg.com/pagemap@1.4.0/dist/pagemap.js
// @updateURL https://gist.github.com/Rychou/bd89375c895b05518ef8eafe7fd26bda/raw/kibana-helper.user.js
// ==/UserScript==
(async function () {
    "use strict";
    await loadJS("https://unpkg.com/@popperjs/core@2");
    await loadJS("https://unpkg.com/tippy.js@6");
    // eslint-ignore
    try {
        // 当 table 高度变化时，重新执行一次 start
        let tableHeight = 0;
        let tippyCount = 0;
        let timer = -1;
        const ipv4Pattern = /((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/g;
        const ipv6Pattern = /^([\da-fA-F]{1,4}:){6}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^::([\da-fA-F]{1,4}:){0,4}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:):([\da-fA-F]{1,4}:){0,3}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){2}:([\da-fA-F]{1,4}:){0,2}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){3}:([\da-fA-F]{1,4}:){0,1}((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){4}:((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$|^([\da-fA-F]{1,4}:){7}[\da-fA-F]{1,4}$|^:((:[\da-fA-F]{1,4}){1,6}|:)$|^[\da-fA-F]{1,4}:((:[\da-fA-F]{1,4}){1,5}|:)$|^([\da-fA-F]{1,4}:){2}((:[\da-fA-F]{1,4}){1,4}|:)$|^([\da-fA-F]{1,4}:){3}((:[\da-fA-F]{1,4}){1,3}|:)$|^([\da-fA-F]{1,4}:){4}((:[\da-fA-F]{1,4}){1,2}|:)$|^([\da-fA-F]{1,4}:){5}:([\da-fA-F]{1,4})?$|^([\da-fA-F]{1,4}:){6}:$/;
        const infoMap = {
            "play() error: NotAllowedError:": {
                tips: (log) => {
                    if (log.includes('main <video>') || log.includes('main <audio>')) {
                        return "远端流自动播放受限导致播放失败"
                    } else {
                        return "本地流出现自动播放失败报错，一般只出现在 Android 微信设备，无需处理"
                    }
                },
                color: 'red',
                class: 'red'
            },
            "has no microphone permision": {
                tips: "采集无声：没有麦克风权限",
            },
            "can not find mic device": {
                tips: "采集无声：Windows找不到麦克风",
            },
            "may be a problem with the audio capture devicem": {
                tips: "采集无声：客户可能选择了一个有问题的采集设备",
            },
            "restart capture device": {
                tips:
                    "频繁出现 restart capture device，说明系统采集异常。",
            },
            "interrupted by other app or system": {
                tips:
                    "被其他应用（系统电话，微信电话，QQ 电话，其他第三方 APP ）打断导致无声",
            },
            "set software capture volume": {
                tips:
                    "设置了软件采集音量，太小会无声哦",
            },
            "set hardware capture volume": {
                tips:
                    "设置了设备采集音量，太小会没有声音",
            },
            "setCurrentMicDeviceMute:": {
                tips:
                    "屏蔽了设备音量",
                color: 'orange',
            },
            "muteLocalAudio mute:1": {
                tips:
                    "本地静音API 屏蔽了自身上行",
                color: 'orange',
            },
            "muteRemoteAudio:": {
                tips: "对远端用户下行mute操作",
            },
            "muteAllRemoteAudio:1": {
                tips: "屏蔽了所有远端下行音频",
                color: 'orange',
            },
            "muteAllRemoteAudio:true": {
                tips: "屏蔽了所有远端下行音频",
                color: 'orange',
            },
            "muteAllRemoteAudio:0": {
                tips: "对所有远端下行音频解除静音",

            },
            "muteLocalAudio mute:true": {
                tips:
                    "本地静音API 屏蔽了自身上行",
                color: 'orange',
            },
            "AudioDevice: can not find speaker device": {
                tips:
                    "用户未插入播放设备：Windwos",
            },
            "muteLocalAudio mute:false": {
                tips:
                    "解除本地静音"
            },
            "muteLocalAudio mute:false": {
                tips:
                    "解除本地静音"
            },
            "restart play device": {
                tips:
                    "频繁出现 restart play device，说明系统播放异常",
            },
            "AudioDevice: current play device changed [kDeviceSpeakerPhone]": {
                tips: "频繁出现 current play device changed，一种情况是没有麦克风权限，SDK会通过重启来恢复导致无声问题",
            },
            "enable soft AEC": {
                tips: "开启了软件AEC",
            },
            "startLocalPreview": {
                tips: "开始预览+采集",

            },
            "stopLocalPreview": {
                tips: "停止采集+预览",
                color: 'orange'
            },
            "muteLocalVideo:true": {
                tips: "mute 上行视频刘",
                color: 'orange'
            },
            "muteLocalVideo:1": {
                tips: "mute 上行音频流",
                color: 'orange'
            },
            "muteRemoteVideoStream:": {
                tips:
                    "对远端流进行mute操作",
                color: 'orange'
            },
            'muteLocalVideo:0': {
                tips: '解除上行屏蔽视频'
            },
            'muteLocalVideo:false': {
                tips: '解除上行屏蔽视频'
            },
            'main stream - video player is starting playing': {
                tips: '远端流视频播放成功',
                color: '#0dd90d',
                class: 'success'
            },
            'stream - video player is starting playing': {
                tips: '本地视频播放成功',
                color: '#0dd90d',
                class: 'success'
            },
            'stream - audio player is starting playing': {
                tips: '本地音频播放成功',
                color: '#0dd90d',
                class: 'success'
            },
            'gotStream': {
                tips: '本地流采集成功'
            },
            'local stream is published successfully': {
                tips: '推流成功',
                color: '#0dd90d',
                class: 'success'
            },
            'encoderImplementation change to OpenH264': {
                tips: '使用软编'
            },
            'encoderImplementation change to ExternalEncoder': {
                tips: '使用硬编'
            },
            'getUserMedia with constraints': {
                tips: '开始媒体（摄像头/麦克风）采集'
            },
            'getDisplayMedia with constraints': {
                tips: '开始屏幕分享采集'
            },
            'client-banned': {
                tips: '被踢出房间',
                color: 'red',
                class: 'red',
                textColor: '#fff'
            },
            'user_timeout': {
                tips: '后台长时间没收到 sdk 心跳导致被踢，通常是用户 JS 线程长时间阻塞导致，若复现概率较高，应用浏览器 Performance 工具分析是哪里导致 JS 线程阻塞。',
                color: 'red',
                class: 'red',
                textColor: '#fff'
            },
            'schedule failed': {
                tips: '信令调度请求失败，不影响正常进房流程，SDK 会连接默认的信令域名。'
            },
            'updateStream() video flag is true, but no camera detected, set video to false': {
                tips: '尝试恢复摄像头采集时，由于检测到没有摄像头，不恢复摄像头采集',
                color: 'orange',
                class: 'orange',
                textColor: '#fff'
            },
            'qualityLimitationReason change to bandwidth': {
                tips: '带宽预估不够导致编码质量受限，可能会出现编码码率、帧率、分辨率降低问题。通常是网络导致。',
                color: 'orange',
                class: 'orange',
                textColor: '#fff'
            },
            'qualityLimitationReason change to cpu': {
                tips: 'cpu 负荷太高导致编码质量受限，可能会出现编码码率、帧率、分辨率降低问题。',
                color: 'orange',
                class: 'orange',
                textColor: '#fff'
            }
        };

        function start() {
            try {
                if (!document.getElementsByClassName("table")[0]) {
                    timer = setTimeout(start, 2000);
                    return;
                }
                // log 在 table 的第几列
                const logCellIndex = [
                    ...document.getElementsByClassName("table")[0].tHead.rows[0].cells,
                ].findIndex((item) => item.innerText.trim() === "log");

                // 日志列表
                const logList = [
                    ...document
                        .getElementsByClassName("table")[0]
                        .tBodies[0].getElementsByClassName("discover-table-row"),
                ].map((item) => item.cells[logCellIndex]);

                const keys = Object.keys(infoMap);

                logList.forEach((item) => {
                    let tempInnerHTML = item.innerHTML;
                    // 1. 给日志添加背景，更易区分不同级别的日志
                    tempInnerHTML = item.innerText
                        .split("\n")
                        .map((log) => {
                            log = log.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
                            if (log.includes("WARN")) {
                                return `<span class='orange' style="background:orange; color:#fff;">${log}</span>`;
                            }
                            if (log.includes("ERROR") || log.includes("error")) {
                                return `<span class='red' style="background:red; color:#fff;">${log}</span>`;
                            }
                            if (log.includes("failed")) {
                                return `<span class='red' style="background:red; color:#fff;">${log}</span>`;
                            }
                            // 高亮 ipv4
                            if (log.includes("clientIp:")) {
                                const ipList = log.match(ipv4Pattern);
                                ipList.forEach((ip) => {
                                    log = log.replaceAll(
                                        ip,
                                        `<a href="https://ip.oa.com/search/?ip=${ip}" target="_blank"><span class='ip' style="background:#e1dfdf">${ip}</span></a>`
                                    );
                                });
                                return log;
                            }
                            return log;
                        })
                        .join("\n");

                    // 2. 给特殊日志增加 tooltips
                    keys.forEach((key) => {
                        if (item.innerText.includes(key)) {
                            const id = `tooltip-${tippyCount}`;
                            tempInnerHTML = tempInnerHTML.replaceAll(
                                new RegExp(`${escapedStringToReg(key)}(?!\<\/span)`, "gi"),
                                `<span id="${id}" class='${infoMap[key].class || infoMap[key].color || 'gray'}' style="background:${infoMap[key].color || '#e1dfdf'}; color: ${infoMap[key].textColor || '#000'}">${key}</span>`
                            );
                            setTimeout(() => {
                                tippy(document.getElementById(`${id}`), {
                                    content: typeof infoMap[key].tips === 'function' ? infoMap[key].tips(item.innerText, logList.map(item => item.innerText)) : infoMap[key].tips ,
                                });
                            }, 500);
                            tippyCount++;
                        }
                    });

                    item.innerHTML = tempInnerHTML;
                });

                tableHeight = document.getElementsByClassName("table")[0].clientHeight;
                initMiniMap();
                initExportLogButton();
                initUpdateButton();
            } catch (error) {}
        }
        start();
        // 当 table 高度变化时，重新执行一次。TODO: 后续可以改成拦截 kibana 拉日志请求，请求成功后执行一次 start
        setInterval(() => {
            if (
                document.getElementsByClassName("table")[0] &&
                document.getElementsByClassName("table")[0].clientHeight !== tableHeight
            ) {
                start();
            }
        }, 2000);
    } catch (error) {
        console.error(error);
    }
})();

// 将字符中的特殊字符添加转义符
function escapedStringToReg(string) {
    return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
}
function loadJS(url) {
    return new Promise((resolve) => {
        var script = document.createElement("script"),
            fn = resolve || function () {};
        script.type = "text/javascript";
        if (script.readyState) {
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;

                    fn();
                }
            };
        } else {
            //其他浏览器
            script.onload = function () {
                fn();
            };
        }

        script.src = url;

        document.getElementsByTagName("head")[0].appendChild(script);
    });
}


function initMiniMap() {
    if (document.querySelector('#mini-map')) {
        document.body.removeChild(document.querySelector('#mini-map'));
    }
    if (document.querySelector('#toggle-mini-map')) {
        document.body.removeChild(document.querySelector('#toggle-mini-map'));
    }
    const canvas = document.createElement('canvas');
    canvas.id = 'mini-map';
    canvas.style = 'position: fixed; top: 0px; right: 0px;width:120px; mix-width:120px; height: 100vh; z-index: 100; cursor: pointer;';

    let showMinimap = true;
    const toggleButton = document.createElement('button');
    toggleButton.id = 'toggle-mini-map'
    toggleButton.innerText = '关闭预览';
    toggleButton.style = `    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out 0s, background-color 0.15s ease-in-out 0s, border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
    position: fixed;
    z-index: 100;
    right: 120px;
    top: 50px;
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;`
    toggleButton.onclick = () => {
        showMinimap = !showMinimap;
        toggleButton.innerText = showMinimap ? '关闭预览' : '开启预览'
        canvas.style.visibility = showMinimap ? 'visible' : 'hidden';
    }
    document.body.appendChild(canvas, null);
    document.body.appendChild(toggleButton, null);
    pagemap(document.querySelector('#mini-map'), {
        viewport: null,
        styles: {
            'tr': 'rgba(0,0,0,0.10)',
            '.red': 'red',
            '.orange': 'orange',
            '.gray': 'gray',
            '.success': '#0dd90d',
            '.ip': '#3c87e8'
        },
        back: 'rgba(0,0,0,0.02)',
        view: 'rgba(0,0,0,0.05)',
        drag: 'rgba(0,0,0,0.10)',
        interval: null
    });
}

function initExportLogButton() {
    const button = document.createElement('button');
    button.innerText = '导出日志';
    button.style = `    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out 0s, background-color 0.15s ease-in-out 0s, border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
    position: fixed;
    z-index: 100;
    right: 120px;
    top: 100px;
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;`
    button.onclick = () => {
        const logs = [...document.querySelectorAll('.discover-table-datafield')].map(item => item.innerText);
        download('log.txt', logs.join('\n'));
    }
    document.body.appendChild(button, null);
}

function initUpdateButton() {
    const button = document.createElement('a');
    button.href = 'https://gist.github.com/Rychou/bd89375c895b05518ef8eafe7fd26bda/raw/kibana-helper.user.js';
    button.target = '_blank'
    button.innerText = '检查更新';
    button.style = `    font-weight: 400;
    text-align: center;
    vertical-align: middle;
    user-select: none;
    border: 1px solid transparent;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    border-radius: 0.25rem;
    transition: color 0.15s ease-in-out 0s, background-color 0.15s ease-in-out 0s, border-color 0.15s ease-in-out 0s, box-shadow 0.15s ease-in-out 0s;
    position: fixed;
    z-index: 100;
    right: 120px;
    top: 150px;
    color: #fff;
    background-color: #007bff;
    border-color: #007bff;`
    document.body.appendChild(button, null);
}


function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}