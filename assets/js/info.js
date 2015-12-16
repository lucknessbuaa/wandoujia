AV.initialize('2lmry6qihN6XAaw3xowIbC9G-gzGzoHsz', 'f1qj8vs0p5COKOMYdpO4kar9');
var Contact = AV.Object.extend('Contact');
ga('send', 'pageview');

$(function() {
    var bgImg = 'url(' + constants.bgImg + ')';
    $('body').css({
        backgroundImage: bgImg,
        backgroundSize: 'cover'
    });
    $('.intro')[0].innerHTML = constants.intro;
    $('#visitAble')[0].innerHTML = constants.buttonVisit;
    $('#visitUnable')[0].innerHTML = constants.buttonUnvisit;
    $('#layerText')[0].innerHTML = constants.layerText;

    var $middle = $('.middle');
    var $layerWrap = $('#layerWrap');
    var $layer = $('#layer');
    var $phone = $('#phone');
    var $email = $('#email');
    $middle.css({
        marginTop: -$middle.height() / 2,
        opacity: 1,
        visibility: 'visible'
    });

    $('#visitAble').click(function() {
        if (!campaignTools.UA.inWdj) {
            return false;
        }

        ga('send', 'event', 'instagram-test', 'download', '');
        var app = {};
        $.ajax({
            url: 'http://www.wandoujia.com/api/apps/apps/com.wandoujia?opt_fields=title,icons.*,apks.*.size,apks.*.bytes,apks.*.downloadUrl.*.url,apks.*.creation,apks.*.versionName,,apks.*.versionCode,installedCountStr',
            dataType: 'jsonp',
            success: function(resp) {
                app = {
                    packageName: 'com.wandoujia',
                    downloadUrl: resp.apks[0].downloadUrl.url,
                    appName: resp.title,
                    iconUrl: resp.icons.px256,
                    size: ''
                };
                campaignTools.installApp(app);
            }
        });
    });

    $('#visitUnable').click(function() {
        ga('send', 'event', 'instagram-test', 'giveup', '');
        $layer.css({
            display: 'block',
        });
        $layerWrap.css({
            marginTop: -$layerWrap.height() / 2
        });
    });

    $('#closeButton').click(function() {
        $layer.css({
            display: 'none'
        }); 
        $phone.val('');
        $email.val('');
    });

    $('#submit').click(function() {
        var phone = $phone.val().trim();
        var email = $email.val().trim();
        if (!phone && !email) {
            alert('手机号或者邮箱不能同时为空！');
            return false;
        }
        if (phone && !/^\d{11}$/.test(phone)) {
            alert('手机号格式不对，请输入11位数字');
            return false;
        }
        var reg = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
        if (email && !reg.test(email)) {
            alert('邮箱格式不对，请输入正确的邮箱！');
            return false;
        }
        
        ga('send', 'event', 'instagram-test', 'submit', '');
        var contact = new Contact();
        contact.set('phone', phone);
        contact.set('email', email);
        contact.save().then(function() {
            alert('成功保存！');
        }).catch(function(e) {
            alert(e);
        });
    });
});
