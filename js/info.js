/*global $, jQuery, ga, _, AV, Parse, FastClick, wx, campaignTools, Swiper, performance, page */
'use strict'

$(function() {
    var $middle = $('.middle');
    var $layerWrap = $('#layerWrap');
    var $layer = $('#layer');
    var $phone = $('#phone');
    var $email = $('#email');
    var constants;
    var appData;

    AV.initialize('2lmry6qihN6XAaw3xowIbC9G-gzGzoHsz', 'f1qj8vs0p5COKOMYdpO4kar9');
    var Contact = AV.Object.extend('Contact');

    function getData(url, dataType, sucessCallback, errorCallback) {
        $.ajax({
            url : url,
            dataType: dataType,
            xhrFields : {
                withCredentials : false
            },
            success : function (resp) {
                sucessCallback(resp);
            },
            error : function (error) {
                console.log(error);
                errorCallback(error);
            }
        });
    }

    function init() {
        getData('http://www.wandoujia.com/needle/source/getJSON/731', 'json', function (resp) {
            constants = resp;

            getData('http://www.wandoujia.com/api/apps/apps/com.wandoujia?opt_fields=title,icons.*,apks.*.size,apks.*.bytes,apks.*.downloadUrl.*.url,apks.*.creation,apks.*.versionName,,apks.*.versionCode,installedCountStr', 'jsonp', function (app) {

                appData = {
                    packageName: 'com.wandoujia',
                    downloadUrl: app.apks[0].downloadUrl.url,
                    appName: app.title,
                    iconUrl: app.icons.px256,
                    size: ''
                };

                renderPage();
            });

        });
    }

    function renderPage () {
        var bgImg = 'url(' + constants.bgImg + ')';
        $('body').css({
            backgroundImage: bgImg,
            backgroundSize: 'cover'
        });
        $('.intro').html(constants.intro);
        $('#visitUnable').html(constants.buttonUnvisit);
        $('#layerText').html(constants.layerText);

        // 如果是在豌豆荚中 并且用户已经装了一览 并且是最新版（不用再升级）
        if (campaignTools.UA.inWdj && campaignTools.isInstalled('com.wandoujia') && !campaignTools.isUpgradable('com.wandoujia')) {
            $('#visitAble').addClass('open').html(constants.buttonOpen);
        } else {
            $('#visitAble').html(constants.buttonVisit);
        }

        $middle.css({
            opacity: 1,
            visibility: 'visible'
        });
    }

    function showTips (str) {
        var $ele = $('#tips');
        $ele.html(str);
        clearTimeout(timer);
        var timer = setTimeout(function () {
            $ele.html('');
        }, 2000);
    }

    function formSubmit () {
        var phone = $phone.val().trim();
        var email = $email.val().trim();
        if (!phone && !email) {
            showTips('手机号或者邮箱不能同时为空！');
            return false;
        }
        if (phone && !/^\d{11}$/.test(phone)) {
            showTips('手机号格式不对，请输入11位数字');
            return false;
        }
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (email && !reg.test(email)) {
            showTips('邮箱格式不对，请输入正确的邮箱！');
            return false;
        }
        
        ga('send', 'event', 'instagram-test', 'submit', '');
        var contact = new Contact();
        contact.set('phone', phone);
        contact.set('email', email);
        contact.set('udid', campaignTools.getUDID());
        contact.save().then(function() {
            showTips('成功保存！');
            clearTimeout(timer);
            var timer = setTimeout(function () {
                layer.bye();
            }, 1600);
        }).catch(function(e) {
            showTips(e);
        });
    }

    var layer = {
        hello: function () {
            ga('send', 'event', 'instagram-test', 'giveup', '');
            $layer.css({
                display: 'block',
            });
            $layerWrap.css({
                marginTop: -$layerWrap.height() / 2
            });
        },
        bye: function () {
            $layer.css({
                display: 'none'
            }); 
            $phone.val('');
            $email.val('');
        }
    };

    $('#visitAble').click(function () {
        if (!campaignTools.UA.inWdj) {
            return false;
        }
        if ($(this).hasClass('open')) {
            ga('send', 'event', 'instagram-test', 'open', '');
            campaignTools.openApp('com.wandoujia');
        } else {
            ga('send', 'event', 'instagram-test', 'download', '');
            campaignTools.installApp(appData);
        }
    });

    $('#visitUnable').click(function() {
        layer.hello();
    });

    $('#closeButton').click(function() {
        layer.bye();
    });

    $('#contact').submit(function(e) {
        e.preventDefault();
        formSubmit();
    });

    // 豌豆荚客户端自己的一个 Bug，需要前端手动 hack 一下
    $('input').focus(function () {
        $('#layerWrap').css({
            marginTop: -$layerWrap.height() / 1
        });
    }).blur(function (e){
        $('#layerWrap').css({
            marginTop: -$layerWrap.height() / 2
        });
        // 如果失去焦点后点击的是提交按钮，直接提交表单
        if (e.relatedTarget && e.relatedTarget.id === 'submit') {
            formSubmit();
        }
    });

    init();
});
