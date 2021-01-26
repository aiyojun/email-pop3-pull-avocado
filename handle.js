console.info("start handle.js");

const ipc = require("electron").ipcRenderer;

Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S"  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
};

function createEmailPage(ele) {
    console.info(ele.id);
    // let ids = ele.id.split('_');
    // console.info(Number.parseInt(ids[ids.length - 1]));
    // ipc.send('createEmailPage', Number.parseInt(ids[ids.length - 1]));
    console.info(ele.id);
    ipc.send('createEmailPage', ele.id);
}

function buildEmailUI(emailIndex, emailTime, emailSender, emailTitle) {
    // console.info(emailIndex);
    // console.info(emailTime);
    // console.info(emailSender);
    // console.info(emailTitle);
    if (emailTitle.length > 30 && emailTitle.length < 50) {/*	color: dimgray;padding-top: 8px;float: right;max-width: calc(100% - 90px);font-weight: bold;font-size: 0.9rem;margin-right: 10px;*/
        return `<div id=\"` + emailIndex + `\" class=\"p_email p_box_shadow\" onclick=\"createEmailPage(this)\"><div class="p_email_flag"><div class="p_email_flag_image"></div></div><div class=\"p_header\"><p class=\"p_email_generic_font p_email_time\">${emailTime}</p><p class=\"p_email_generic_font p_email_sender\">${emailSender}</p></div><div class=\"p_header\"><p style="color: dimgray;padding-top: 8px;float: right;max-width: calc(100% - 90px);font-weight: bold;font-size: 0.75rem;margin-right: 10px;">${emailTitle}</p></div></div>`;
    } else if (emailTitle.length >= 50) {
        emailTitle = emailTitle.substr(0, 45) + "...";
        return `<div id=\"` + emailIndex + `\" class=\"p_email p_box_shadow\" onclick=\"createEmailPage(this)\"><div class="p_email_flag"><div class="p_email_flag_image"></div></div><div class=\"p_header\"><p class=\"p_email_generic_font p_email_time\">${emailTime}</p><p class=\"p_email_generic_font p_email_sender\">${emailSender}</p></div><div class=\"p_header\"><p style="color: dimgray;padding-top: 8px;float: right;max-width: calc(100% - 90px);font-weight: bold;font-size: 0.75rem;margin-right: 10px;">${emailTitle}</p></div></div>`;
    }
// <div class="p_email_flag"></div>
    return `<div id=\"` + emailIndex + `\" class=\"p_email p_box_shadow\" onclick=\"createEmailPage(this)\"><div class="p_email_flag"><div class="p_email_flag_image"></div></div><div class=\"p_header\"><p class=\"p_email_generic_font p_email_time\">${emailTime}</p><p class=\"p_email_generic_font p_email_sender\">${emailSender}</p></div><div class=\"p_header\"><p class=\"p_email_title\">${emailTitle}</p></div></div>`;
    // return "<div id=\"{id}\" class=\"p_email p_box_shadow\"><div class=\"p_email_flag\"></div><p class=\"p_email_generic_font p_email_time\">{tim}</p><p class=\"p_email_generic_font p_email_sender\">{send}</p><p class=\"p_email_generic_font p_email_title\">{title}</p></div>".format({
    //     id: "email-" + emailIndex.toString(),
    //     tim: emailTime,
    //     send: emailSender,
    //     title: emailTitle
    // });
}

ipc.on('settingData', (event, args) => {
    console.info("setting json: " + args.toString());
    const settingJson = JSON.parse(args.toString());
    document.getElementById('pid_server').value = settingJson.server;
    document.getElementById('pid_email').value = settingJson.email;
    document.getElementById('pid_password').value = settingJson.password;
});

let isFirst = true;

let notifyTimeout = 5000;
let timeout = 30000;

ipc.on('emailsJson2', (args) => {
    if (isFirst) isFirst = false;
    // console.info("----12121-begin");
    window.setTimeout(globalContext.doPull, timeout); // half of one minute!
    // console.info("----12121-end");
});

ipc.on('emailsJson', (event, args) => {
    if (!isFirst) {
        document.getElementById('pid_new_email').style.display = 'block';
        window.setTimeout(() => {
            document.getElementById('pid_new_email').style.display = 'none';
            console.info("hidden notify")
        }, notifyTimeout);
    }
    // console.info("emailsJson: " + args.toString());
    // console.info("-----1-----");
    // console.info(args.toString());
    let emailsJson = JSON.parse(args.toString());
    let emailsContainer = document.getElementById('pid_email_list');
    emailsContainer.innerHTML = "";
    // console.info("time: " + new Date(emailsJson['time']).format("yyyy-MM-dd hh:mm:ss"));
    // console.info(emailsJson.toString());
    // console.info(typeof emailsJson);
    // console.info(typeof emailsJson.emails);
    // console.info(emailsJson.emails);
    for (let i in emailsJson.emails) {
        let emailOneJson = emailsJson.emails[i];
        console.info("uuid: " + emailOneJson.toString());
        emailsContainer.innerHTML += buildEmailUI(
            emailOneJson.uuid,
            new Date(emailOneJson.date).format("yyyy-MM-dd hh:mm:ss"),
            emailOneJson.from,
            emailOneJson.subject
        );
    }
    // console.info("----12121-begin");
    window.setTimeout(globalContext.doPull, timeout);
    // window.setInterval(globalContext.doPull, 10000);
    // console.info("----12121-end");
});

const globalContext = {
    openSettings: function () {
        console.info("open settings page ...");
        ipc.send('openSettings', '')
    },
    doPull: function () {
        console.info("execute do pull ...");
        ipc.send('doPull', '')
    },
    closeApp: function () {
        ipc.send('closeApp', '');
    }
};
