window.mobileAndTabletcheck = function() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
};
function manageSubmenu() {
    $("body").hasClass("submenu-hover") ? ($(".img-submenu-hover").removeClass("hidden"), $(".img-submenu-click").addClass("hidden"), $(".submenu-txt").html("current layout: <strong>sidebar submenu on hover</strong>")) : ($(".img-submenu-hover").addClass("hidden"), $(".img-submenu-click").removeClass("hidden"), $(".submenu-txt").html("current layout: <strong>sidebar submenu on click</strong>"))
}
function manageLayout() {
    $("body").hasClass("rtl") ? ($(".img-sidebar-left").addClass("hidden"), $(".img-sidebar-right").removeClass("hidden"), $(".rtl-txt").html("current layout: <strong>sidebar on right / RTL enable</strong>")) : ($(".img-sidebar-left").removeClass("hidden"), $(".img-sidebar-right").addClass("hidden"), $(".rtl-txt").html("current layout: <strong>sidebar on left / RTL disable</strong>")), $("body").hasClass("fixed-sidebar") ? ($(".img-sidebar-fluid").addClass("hidden"), $(".img-sidebar-fixed").removeClass("hidden"), $(".sidebar-txt").html("current layout: <strong>sidebar fixed</strong>")) : ($(".img-sidebar-fluid").removeClass("hidden"), $(".img-sidebar-fixed").addClass("hidden"), $(".sidebar-txt").html("current layout: <strong>sidebar fluid</strong>")), $("body").hasClass("fixed-topbar") ? ($(".img-topbar-fluid").addClass("hidden"), $(".img-topbar-fixed").removeClass("hidden"), $(".topbar-txt").html("current layout: <strong>topbar fixed</strong>")) : ($(".img-topbar-fluid").removeClass("hidden"), $(".img-topbar-fixed").addClass("hidden"), $(".topbar-txt").html("current layout: <strong>topbar fluid</strong>")), $("body").hasClass("sidebar-top") ? ($(".layout-sidebar-top .img-sidebar-top").removeClass("hidden"), $(".layout-sidebar-top .img-sidebar-side").addClass("hidden"), $(".sidebar-top-txt").html("current layout: <strong>sidebar on top</strong>")) : ($(".layout-sidebar-top .img-sidebar-top").addClass("hidden"), $(".layout-sidebar-top .img-sidebar-side").removeClass("hidden"), $(".sidebar-top-txt").html("current layout: <strong>sidebar on side</strong>")), $("body").hasClass("sidebar-hover") ? ($(".img-sidebar-click").addClass("hidden"), $(".img-sidebar-hover").removeClass("hidden"), $(".sidebar-hover-txt").html("current layout: <strong>sidebar on hover</strong>")) : ($(".img-sidebar-click").removeClass("hidden"), $(".img-sidebar-hover").addClass("hidden"), $(".sidebar-hover-txt").html("current layout: <strong>sidebar on click</strong>")), $("body").hasClass("boxed") ? ($(".layout-boxed .img-boxed").removeClass("hidden"), $(".layout-boxed .img-sidebar-large").addClass("hidden"), $(".boxed-txt").html("current layout: <strong>boxed page</strong>")) : ($(".layout-boxed .img-boxed").addClass("hidden"), $(".layout-boxed .img-sidebar-large").removeClass("hidden"), $(".boxed-txt").html("current layout: <strong>fullwidth page</strong>")), $("body").hasClass("sidebar-collapsed") ? ($(".layout-sidebar-collapsed .img-sidebar-collapsed").removeClass("hidden"), $(".layout-sidebar-collapsed .img-sidebar-large").addClass("hidden"), $(".sidebar-collapsed-txt").html("current layout: <strong>sidebar collapsed</strong>")) : ($(".layout-sidebar-collapsed .img-sidebar-collapsed").addClass("hidden"), $(".layout-sidebar-collapsed .img-sidebar-large").removeClass("hidden"), $(".sidebar-collapsed-txt").html("current layout: <strong>sidebar normal</strong>"))
}
angular.module("newApp").factory("layoutApiService", ["applicationService", function (e) {
    var a = function () {
        $(".page-content").hasClass("page-sidebar-hover") || e.removeSidebarHover(), $(".page-content").hasClass("page-rtl") || e.disableRTL(), $(".page-content").hasClass("page-boxed") || e.removeBoxedLayout(), $(".page-content").hasClass("page-submenu-hover") && createSubmenuHover(), setTimeout(function () {
            manageSubmenu(), manageLayout()
        }, 100), $(".submenu-layout").on("click", function () {
            manageSubmenu()
        }), $(".layout-options a:not(.submenu-layout)").on("click", function () {
            manageLayout()
        })
    };
    return {init: a}
}]);

angular.module("newApp").factory("applicationService", ["pluginsService", function (e) {
    function t() {
        $("#switch-rtl").prop("checked", !0), $("body").removeClass("rtl").addClass("rtl"), $("html").removeClass("rtl").addClass("rtl"), $(".sidebar").css("width", ""), $(".sidebar .searchform input").css("width", ""), $(".sidebar .sidebar-footer").css("width", ""), $(".logopanel").css("width", ""), $(".searchform input").css("width", ""), $(".sidebar .sidebar-footer .pull-left").css(""), $(".main-content").css("margin-left", ""), $(".topbar").css("left", ""), $("body").hasClass("sidebar-hover") && sidebarHover(), $("#switch-rtl").prop("checked", !0), w(), $.cookie("rtl", 1, {path: "/"})
    }

    function a() {
        $("#switch-rtl").prop("checked", !1), $("html").removeClass("rtl"), $("body").removeClass("rtl"), $(".sidebar").css("width", ""), $(".sidebar").css("left", ""), $(".sidebar .searchform input").css("width", ""), $(".sidebar .sidebar-footer").css("width", ""), $(".logopanel").css("width", ""), $(".searchform input").css("width", ""), $(".sidebar .sidebar-footer .pull-left").css(""), $(".main-content").css("margin-right", ""), $(".topbar").css("right", ""), $("body").hasClass("sidebar-hover") && sidebarHover(), w(), $.removeCookie("rtl", {path: "/"})
    }

    function i() {
        $("html").hasClass("rtl") ? a() : t()
    }

    function s() {
        $("#switch-sidebar").prop("checked", !0), $("#switch-submenu").prop("checked", !1), $.removeCookie("submenu-hover"), $("body").hasClass("sidebar-top") && ($("body").removeClass("fixed-topbar").addClass("fixed-topbar"), $.removeCookie("fluid-topbar"), $("#switch-topbar").prop("checked", !0)), $("body").removeClass("fixed-sidebar").addClass("fixed-sidebar"), $(".sidebar").height(""), w(), $("body").hasClass("sidebar-collapsed") || m(), I(), $.removeCookie("fluid-sidebar", {path: "/"}), $.cookie("fixed-sidebar", 1, {path: "/"})
    }

    function o() {
        $("#switch-sidebar").prop("checked", !1), $("body").hasClass("sidebar-hover") && (h(), $("#switch-sidebar-hover").prop("checked", !1)), $("body").removeClass("fixed-sidebar"), w(), B(), $.removeCookie("fixed-sidebar", {path: "/"}), $.cookie("fluid-sidebar", 1, {path: "/"})
    }

    function r() {
        $("body").hasClass("fixed-sidebar") ? o() : s()
    }

    function n() {
        $("#switch-sidebar-top").prop("checked", !0), h(), $("body").removeClass("sidebar-collapsed"), $.removeCookie("sidebar-collapsed"), $("body").removeClass("sidebar-top").addClass("sidebar-top"), $(".main-content").css("margin-left", "").css("margin-right", ""), $(".topbar").css("left", "").css("right", ""), $("body").hasClass("fixed-sidebar") && !$("body").hasClass("fixed-topbar") && ($("body").removeClass("fixed-topbar").addClass("fixed-topbar"), $.removeCookie("fluid-topbar"), $.removeCookie("fluid-topbar"), $("#switch-topbar").prop("checked", !0)), $(".sidebar").height(""), B(), $("#switch-sidebar-hover").prop("checked", !1), w(), $.cookie("sidebar-top", 1, {path: "/"}), $.removeCookie("sidebar-hover", {path: "/"})
    }

    function l() {
    }

    function d() {
    }

    function c() {
        $("body").addClass("sidebar-hover"), $("body").removeClass("fixed-sidebar").addClass("fixed-sidebar"), $(".main-content").css("margin-left", "").css("margin-right", ""), $(".topbar").css("left", "").css("right", ""), $("body").removeClass("sidebar-top"), m(), y(), T(), sidebarHover(), s(), $("#switch-sidebar-hover").prop("checked", !0), $("#switch-sidebar").prop("checked", !0), $("#switch-sidebar-top").prop("checked", !1), $("#switch-boxed").prop("checked", !1), $.removeCookie("fluid-topbar"), $.removeCookie("fluid-topbar", {path: "/"}), $.removeCookie("sidebar-top", {path: "/"}), $.cookie("sidebar-hover", 1, {path: "/"})
    }

    function h() {
        $("#switch-sidebar-hover").prop("checked", !1), $("body").removeClass("sidebar-hover"), $("body").hasClass("boxed") || $(".sidebar, .sidebar-footer").attr("style", ""), $(".logopanel2").remove(), $.removeCookie("sidebar-hover", {path: "/"})
    }

    function u() {
        $("body").hasClass("sidebar-hover") ? h() : c()
    }

    function p() {
        h(), o(), $("#switch-submenu-hover").prop("checked", !0), $("body").addClass("submenu-hover"), $(".nav-sidebar .children").css("display", ""), $.cookie("submenu-hover", 1, {path: "/"}), $("#switch-sidebar").prop("checked", !1)
    }

    function m() {
        $("#switch-submenu-hover").prop("checked", !1), $("body").removeClass("submenu-hover"), $(".nav-sidebar .nav-parent.active .children").css("display", "block"), $.removeCookie("submenu-hover", {path: "/"})
    }

    function f() {
        $("body").hasClass("submenu-hover") ? m() : p()
    }

    function b() {
        $("#switch-topbar").prop("checked", !0), $("body").removeClass("fixed-topbar").addClass("fixed-topbar"), $.removeCookie("fluid-topbar"), $.removeCookie("fluid-topbar", {path: "/"})
    }

    function v() {
        $("#switch-topbar").prop("checked", !1), $("body").removeClass("fixed-topbar"), $("body").hasClass("sidebar-top") && $("body").hasClass("fixed-sidebar") && ($("body").removeClass("fixed-sidebar"), $("#switch-sidebar").prop("checked", !1)), $.cookie("fluid-topbar", 1, {path: "/"})
    }

    function g() {
        $("body").hasClass("fixed-topbar") ? v() : b()
    }

    function w() {
    }

    function C() {
        h(), $("body").addClass("boxed"), w(), $("#switch-boxed").prop("checked", !0), $.cookie("boxed-layout", 1, {path: "/"})
    }

    function y() {
        $("body").hasClass("boxed") && ($("body").removeClass("boxed"), $logopanel.css("left", "").css("right", ""), $topbar.css("width", ""), $sidebar.css("margin-left", "").css("margin-right", ""), $sidebarFooter.css("left", "").css("right", ""), $.removeCookie("boxed-layout", {path: "/"}), $("#switch-boxed").prop("checked", !1), $.backstretch("destroy"))
    }

    function k() {
        $("body").hasClass("boxed") ? y() : C()
    }

    function x() {
        "relative" != $body.css("position") ? $body.hasClass("sidebar-collapsed") ? T() : S() : $body.hasClass("sidebar-show") ? $body.removeClass("sidebar-show") : $body.addClass("sidebar-show"), w()
    }

    function S() {
        $body.addClass("sidebar-collapsed"), $(".sidebar").css("width", "").resizable().resizable("destroy"), $(".nav-sidebar ul").attr("style", ""), $(this).addClass("menu-collapsed"), B(), $("#switch-sidebar").prop("checked"), $.cookie("sidebar-collapsed", 1, {path: "/"})
    }

    function T() {
        $body.removeClass("sidebar-collapsed"), $body.hasClass("submenu-hover") || $(".nav-sidebar li.active ul").css({display: "block"}), $(this).removeClass("menu-collapsed"), $body.hasClass("sidebar-light") && !$body.hasClass("sidebar-fixed") && $(".sidebar").height(""), I(), $.removeCookie("sidebar-collapsed", {path: "/"})
    }

    function z() {
        $("#reset-style").on("click", function (e) {
            e.preventDefault(), y(), h(), m(), T(), a(), $.removeCookie("rtl"), $.removeCookie("main-color"), $.removeCookie("main-name"), $.removeCookie("theme"), $.removeCookie("bg-name"), $.removeCookie("bg-color"), $.removeCookie("submenu-hover"), $.removeCookie("sidebar-collapsed"), $.removeCookie("boxed-layout"), $.removeCookie("boxed-layout", {path: "/"}), $.removeCookie("rtl", {path: "/"}), $.removeCookie("main-color", {path: "/"}), $.removeCookie("main-name", {path: "/"}), $.removeCookie("theme", {path: "/"}), $.removeCookie("bg-name", {path: "/"}), $.removeCookie("bg-color", {path: "/"}), $.removeCookie("submenu-hover", {path: "/"}), $.removeCookie("sidebar-collapsed", {path: "/"}), $("body").removeClass(function (e, t) {
                return (t.match(/(^|\s)bg-\S+/g) || []).join(" ")
            }), $("body").removeClass(function (e, t) {
                return (t.match(/(^|\s)color-\S+/g) || []).join(" ")
            }), $("body").removeClass(function (e, t) {
                return (t.match(/(^|\s)theme-\S+/g) || []).join(" ")
            }), $("body").addClass("theme-sdtl").addClass("color-default"), $(".builder .theme-color").removeClass("active"), $(".theme-color").each(function () {
                "#319DB5" == $(this).data("color") && $(this).addClass("active")
            }), $(".builder .theme").removeClass("active"), $(".builder .theme-default").addClass("active"), $(".builder .sp-replacer").removeClass("active")
        })
    }

    function F() {
        doc.fullscreenElement || doc.msFullscreenElement || doc.webkitIsFullScreen || doc.mozFullScreenElement ? doc.exitFullscreen ? doc.exitFullscreen() : doc.webkitExitFullscreen ? doc.webkitExitFullscreen() : doc.webkitCancelFullScreen ? doc.webkitCancelFullScreen() : doc.msExitFullscreen ? doc.msExitFullscreen() : doc.mozCancelFullScreen && doc.mozCancelFullScreen() : docEl.requestFullscreen ? docEl.requestFullscreen() : docEl.webkitRequestFullScreen ? docEl.webkitRequestFullscreen() : docEl.webkitRequestFullScreen ? docEl.webkitRequestFullScreen() : docEl.msRequestFullscreen ? docEl.msRequestFullscreen() : docEl.mozRequestFullScreen && docEl.mozRequestFullScreen()
    }

    function D(e) {
        $(e).block({
            message: '<svg class="circular"><circle class="path" cx="40" cy="40" r="10" fill="none" stroke-width="2" stroke-miterlimit="10"/></svg>',
            css: {border: "none", width: "14px", backgroundColor: "none"},
            overlayCSS: {backgroundColor: "#fff", opacity: .6, cursor: "wait"}
        })
    }

    function E(e) {
        $(e).unblock()
    }

    function q() {
        $(".panel-controls").each(function () {
            var e = '<div class="control-btn"><a href="#" class="panel-reload hidden"><i class="icon-reload"></i></a><a class="hidden" id="dropdownMenu1" data-toggle="dropdown"><i class="icon-settings"></i></a><ul class="dropdown-menu pull-right" role="menu" aria-labelledby="dropdownMenu1"><li><a href="#">Action</a></li><li><a href="#">Another action</a></li><li><a href="#">Something else here</a></li></ul><a href="#" class="panel-popout hidden tt" title="Pop Out/In"><i class="icons-office-58"></i></a><a href="#" class="panel-maximize hidden"><i class="icon-size-fullscreen"></i></a><a href="#" class="panel-toggle"><i class="fa fa-angle-down"></i></a><a href="#" class="panel-close"><i class="fa fa-trash-o"></i></a></div>';
            $(this).append(e)
        })
    }

    function A() {
        q(), $(".panel-header .panel-toggle").click(function (e) {
            e.preventDefault(), $(this).toggleClass("closed").parents(".panel:first").find(".panel-content").slideToggle()
        }), $(".panel-header .panel-popout").click(function (e) {
            e.preventDefault();
            var t = $(this).parents(".panel:first");
            if (t.hasClass("modal-panel"))$("i", this).removeClass("icons-office-55").addClass("icons-office-58"), t.removeAttr("style").removeClass("modal-panel"), t.find(".panel-maximize,.panel-toggle").removeClass("nevershow"), t.draggable("destroy").resizable("destroy"); else {
                t.removeClass("maximized"), t.find(".panel-maximize,.panel-toggle").addClass("nevershow"), $("i", this).removeClass("icons-office-58").addClass("icons-office-55");
                var a = t.width(), i = t.height();
                t.addClass("modal-panel").removeAttr("style").width(a).height(i), $(t).draggable({
                    handle: ".panel-header",
                    containment: ".page-content"
                }).css({left: t.position().left - 10, top: t.position().top + 2}).resizable({
                    minHeight: 150,
                    minWidth: 200
                })
            }
            window.setTimeout(function () {
                $("body").trigger("resize")
            }, 300)
        }), $(".panel-header .panel-reload").click(function (e) {
            e.preventDefault(), e.stopPropagation();
            var t = $(this).parents(".panel:first");
            D(t), window.setTimeout(function () {
                E(t)
            }, 1800)
        }), $(".panel-header .panel-maximize").click(function (t) {
            t.preventDefault();
            var a = $(this).parents(".panel:first");
            return $body.toggleClass("maximized-panel"), a.removeAttr("style").toggleClass("maximized"), H(), a.hasClass("maximized") ? (a.parents(".portlets:first").sortable("destroy"), $(window).trigger("resize")) : ($(window).trigger("resize"), e.sortablePortlets()), $("i", this).toggleClass("icon-size-fullscreen").toggleClass("icon-size-actual"), a.find(".panel-toggle").toggleClass("nevershow"), $("body").trigger("resize"), !1
        })
    }

    function H() {
        if ($(".maximized").length) {
            var e = $(".maximized"), t = $(window).height() - 2;
            panelHeight = e.find(".panel-header").height() + e.find(".panel-content").height() + 100, e.parent().height(e.hasClass("maximized") ? t > panelHeight ? t : $(".main-content").height() > panelHeight ? $(".main-content").height() : panelHeight : "")
        }
    }

    function R() {
        $.fn.mCustomScrollbar && $(".withScroll").each(function () {
            $(this).mCustomScrollbar("destroy");
            var e = $(this).data("height") ? $(this).data("height") : "auto", t = $(this).data("padding") ? $(this).data("padding") : 0;
            "window" == $(this).data("height") && (thisHeight = $(this).height(), windowHeight = $(window).height() - t - 50, e = thisHeight < windowHeight ? thisHeight : windowHeight), $(this).mCustomScrollbar({
                scrollButtons: {enable: !1},
                autoHideScrollbar: $(this).hasClass("show-scroll") ? !1 : !0,
                scrollInertia: 150,
                theme: "light",
                set_height: e,
                advanced: {updateOnContentResize: !0}
            })
        })
    }

    function _() {
        $(".menu-settings").on("click", "#reorder-menu", function (e) {
            e.preventDefault(), $(".nav-sidebar").removeClass("remove-menu"), $(".nav-sidebar").sortable({
                connectWith: ".nav-sidebar > li",
                handle: "a",
                placeholder: "nav-sidebar-placeholder",
                opacity: .5,
                axis: "y",
                dropOnEmpty: !0,
                forcePlaceholderSize: !0,
                receive: function () {
                    $("body").trigger("resize")
                }
            }), $(".nav-sidebar .children").sortable({
                connectWith: "li",
                handle: "a",
                opacity: .5,
                dropOnEmpty: !0,
                forcePlaceholderSize: !0,
                receive: function () {
                    $("body").trigger("resize")
                }
            }), $(this).attr("id", "end-reorder-menu"), $(this).html("End reorder menu"), $(".remove-menu").attr("id", "remove-menu").html("Remove menu")
        }), $(".menu-settings").on("click", "#end-reorder-menu", function (e) {
            e.preventDefault(), $(".nav-sidebar").sortable(), $(".nav-sidebar").sortable("destroy"), $(".nav-sidebar .children").sortable().sortable("destroy"), $(this).attr("id", "remove-menu").html("Reorder menu")
        })
    }

    function P() {
        $(".menu-settings").on("click", "#remove-menu", function (e) {
            e.preventDefault(), $(".nav-sidebar").sortable(), $(".nav-sidebar").sortable("destroy"), $(".nav-sidebar .children").sortable().sortable("destroy"), $(".nav-sidebar").removeClass("remove-menu").addClass("remove-menu"), $(this).attr("id", "end-remove-menu").html("End remove menu"), $(".reorder-menu").attr("id", "reorder-menu").html("Reorder menu")
        }), $(".menu-settings").on("click", "#end-remove-menu", function (e) {
            e.preventDefault(), $(".nav-sidebar").removeClass("remove-menu"), $(this).attr("id", "remove-menu").html("Remove menu")
        }), $(".sidebar").on("click", ".remove-menu > li", function () {
            $menu = $(this), $remove_txt = $(this).hasClass("nav-parent") ? "Are you sure to remove this menu (all submenus will be deleted too)?" : "Are you sure to remove this menu?", bootbox.confirm($remove_txt, function (e) {
                e === !0 && ($menu.addClass("animated bounceOutLeft"), window.setTimeout(function () {
                    $menu.remove()
                }, 300))
            })
        })
    }

    function L() {
        $(".menu-settings").on("click", "#hide-top-sidebar", function (e) {
            e.preventDefault();
            var t = $(this).text();
            $(".sidebar .sidebar-top").slideToggle(300), "Hide user & search" == t && $(this).text("Show user & search")
        }), $(".topbar").on("click", ".toggle-sidebar-top", function (e) {
            e.preventDefault(), $(".sidebar .sidebar-top").slideToggle(300), $(".toggle-sidebar-top span").hasClass("fa fa-user-following") ? $(".toggle-sidebar-top span").removeClass("fa fa-user").addClass("fa fa-user") : $(".toggle-sidebar-top span").removeClass("fa fa-user").addClass("fa fa-user")
        })
    }

    function O() {
        $(".sidebar").on("click", ".user-login li a", function (e) {
            e.preventDefault();
            var t = $(this).find("span").text();
            currentStatut = $(".user-login button span").text(), $(".user-login button span").text(t), "Busy" == t && $(".user-login button i:not(.fa)").removeClass().addClass("busy"), "Invisible" == t && $(".user-login button i:not(.fa)").removeClass().addClass("turquoise"), "Away" == t && $(".user-login button i:not(.fa)").removeClass().addClass("away")
        })
    }

    function I() {
        $.fn.mCustomScrollbar && (B(), $("body").hasClass("sidebar-collapsed") || $("body").hasClass("sidebar-collapsed") || $("body").hasClass("submenu-hover") || !$("body").hasClass("fixed-sidebar") || $(".sidebar-inner").mCustomScrollbar({
            scrollButtons: {enable: !1},
            autoHideScrollbar: !0,
            scrollInertia: 150,
            theme: "light-thin",
            advanced: {updateOnContentResize: !0}
        }), $("body").hasClass("sidebar-top") && B())
    }

    function B() {
        $(".sidebar-inner").mCustomScrollbar("destroy")
    }

    function M() {
        $("body").hasClass("sidebar-collapsed") || $("body").hasClass("sidebar-top") || $("body").hasClass("submenu-hover") ? $(".nav-sidebar .children").css({display: ""}) : $(".nav-active.active .children").css("display", "block"), $(".sidebar").on("click", ".nav-sidebar li.nav-parent > a", function (e) {
            if (e.preventDefault(), (!$("body").hasClass("sidebar-collapsed") || $("body").hasClass("sidebar-hover")) && !$("body").hasClass("submenu-hover")) {
                var t = $(this).parent().parent();
                t.children("li.active").children(".children").slideUp(200), $(".nav-sidebar .arrow").removeClass("active"), t.children("li.active").removeClass("active");
                var a = $(this).next();
                a.is(":visible") ? (a.children().addClass("hidden-item"), $(this).parent().removeClass("active"), a.slideUp(200, function () {
                    a.children().removeClass("hidden-item")
                })) : ($(this).find(".arrow").addClass("active"), a.children().addClass("is-hidden"), setTimeout(function () {
                    a.children().addClass("is-shown")
                }, 0), a.slideDown(200, function () {
                    $(this).parent().addClass("active"), setTimeout(function () {
                        a.children().removeClass("is-hidden").removeClass("is-shown")
                    }, 500)
                }))
            }
        })
    }

    function W() {
        if ($(".sidebar-widgets .folders").length && ($(".new-folder").on("click", function () {
                return $(".sidebar-widgets .add-folder").show(), !1
            }), $(".add-folder input").keypress(function (e) {
                13 == e.which && ($(".sidebar-widgets .add-folder").hide(), $('<li><a href="#"><i class="icon-docs c-blue"></i>' + $(this).val() + "</a> </li>").insertBefore(".add-folder"), $(this).val(""))
            }), $(".main-content").click(function (e) {
                addFolder = document.getElementById("add-folder");
                var t = e.target;
                t !== addFolder && $(".sidebar-widgets .add-folder").hide()
            })), $(".sidebar-widgets .folders").length && ($(".new-label").on("click", function () {
                return $(".sidebar-widgets .add-label").show(), !1
            }), $(".add-label input").keypress(function (e) {
                13 == e.which && ($(".sidebar-widgets .add-label").hide(), $('<li><a href="#"><i class="fa fa-circle-o c-blue"></i>' + $(this).val() + "</a> </li>").insertBefore(".add-label"), $(this).val(""))
            }), $(".main-content").click(function (e) {
                addFolder = document.getElementById("add-label");
                var t = e.target;
                t !== addFolder && $(".sidebar-widgets .add-label").hide()
            })), $.fn.sparkline && $(".dynamicbar1").length) {
            var e = [13, 14, 16, 15, 11, 14, 20, 14, 12, 16, 11, 17, 19, 16], t = [14, 17, 16, 12, 18, 16, 22, 15, 14, 17, 11, 18, 11, 12], a = [18, 14, 15, 14, 15, 12, 21, 16, 18, 14, 12, 15, 17, 19];
            $(".dynamicbar1").sparkline(e, {
                type: "bar",
                barColor: "#319DB5",
                barWidth: 4,
                barSpacing: 1,
                height: "28px"
            }), $(".dynamicbar2").sparkline(t, {
                type: "bar",
                barColor: "#C75757",
                barWidth: 4,
                barSpacing: 1,
                height: "28px"
            }), $(".dynamicbar3").sparkline(a, {
                type: "bar",
                barColor: "#18A689",
                barWidth: 4,
                barSpacing: 1,
                height: "28px"
            })
        }
        $(".sidebar-widgets .progress-chart").length && $(window).load(function () {
            setTimeout(function () {
                $(".sidebar-widgets .progress-chart .stat1").progressbar()
            }, 900), setTimeout(function () {
                $(".sidebar-widgets .progress-chart .stat2").progressbar()
            }, 1200), setTimeout(function () {
                $(".sidebar-widgets .progress-chart .stat3").progressbar()
            }, 1500)
        }), $(".sidebar").on("click", ".hide-widget", function (e) {
            if (e.preventDefault(), 0 == start) {
                start = (new Date).getTime(), $(this).toggleClass("widget-hidden");
                var t = $(this).parent().parent().next();
                t.slideToggle(200, function () {
                    I()
                }), end = (new Date).getTime(), delta = end - start
            } else if (end = (new Date).getTime(), delta = end - start, delta > 200) {
                start = (new Date).getTime(), $(this).toggleClass("widget-hidden");
                var t = $(this).parent().parent().next();
                t.slideToggle(200, function () {
                    I()
                }), end = (new Date).getTime(), delta = end - start
            }
        })
    }

    function j() {
        if ($(".nav-horizontal").length > 0) {
            topbarWidth = $(".topbar").width(), headerRightWidth = $(".header-right").width(), headerLeftWidth = $(".header-left .nav-horizontal").length ? $(".header-left").width() + 40 : 140 * $(".nav-sidebar.nav-horizontal > li").length;
            var e = topbarWidth - headerLeftWidth - headerRightWidth;
            "relative" == $(".nav-horizontal").css("position") || 0 > e ? (2 == $(".sidebar .nav-sidebar").length ? $(".nav-horizontal").insertAfter(".nav-sidebar:eq(1)") : 0 == $(".sidebar .nav-horizontal").length && ($(".nav-horizontal").appendTo(".sidebar-inner"), $(".sidebar-widgets").css("margin-bottom", 20)), $(".nav-horizontal").css({display: "block"}).addClass("nav-sidebar").css("margin-bottom", 100), I(), $(".nav-horizontal .children").removeClass("dropdown-menu"), $(".nav-horizontal > li").each(function () {
                $(this).removeClass("open"), $(this).find("a").removeAttr("class"), $(this).find("a").removeAttr("data-toggle")
            }), $(".nav-horizontal").hasClass("mmenu") && $(".nav-horizontal.mmenu").css("height", 0).css("overflow", "hidden")) : ($(".sidebar .nav-horizontal").length > 0 && ($(".sidebar-widgets").css("margin-bottom", 100), $(".nav-horizontal").removeClass("nav-sidebar").appendTo(".topnav"), $(".nav-horizontal .children").addClass("dropdown-menu").removeAttr("style"), $(".nav-horizontal li:last-child").show(), $(".nav-horizontal > li > a").each(function () {
                $(this).parent().removeClass("active"), $(this).parent().find(".dropdown-menu").length > 0 && ($(this).attr("class", "dropdown-toggle"), $(this).attr("data-toggle", "dropdown"))
            })), $(".nav-horizontal").hasClass("mmenu") && $(".nav-horizontal.mmenu").css("height", "").css("overflow", ""))
        }
    }

    function G() {
        $(window).scroll(function () {
            $(this).scrollTop() > 100 ? $(".scrollup").fadeIn() : $(".scrollup").fadeOut()
        }), $(".scrollup").click(function () {
            return $("html, body").animate({scrollTop: 0}, 1e3), !1
        })
    }

    function N() {
    }

    function U() {
        var e = window.navigator.userAgent, t = e.indexOf("MSIE "), a = e.indexOf("Trident/"), i = e.indexOf("Edge/");
        (t > 0 || a > 0 || i > 0) && $("html").addClass("ie-browser")
    }

    function Y() {
        yy();
        //$body = $("body"), $logopanel = $(".logopanel"), $("[data-toggle]").on("click", function (e) {
        //    e.preventDefault();
        //    var t = $(this).data("toggle");
        //    "rtl" == t && i(), "sidebar-behaviour" == t && r(), "submenu" == t && f(), "sidebar-collapsed" == t && x(), "sidebar-top" == t && d(), "sidebar-hover" == t && u(), "boxed" == t && k(), "topbar" == t && g()
        //}), $("body").hasClass("rtl") && (is_RTL = !0), $(".toggle_fullscreen").click(function () {
        //    F()
        //});
        //var e;
        //$(".nav-sidebar > li").hover(function () {
        //    clearTimeout(e), $(this).siblings().removeClass("nav-hover"), $(this).addClass("nav-hover")
        //}, function () {
        //    var t = $(this);
        //    e = setTimeout(function () {
        //        t.removeClass("nav-hover")
        //    }, 200)
        //}), $(".nav-sidebar > li .children").hover(function () {
        //    clearTimeout(e), $(this).closest(".nav-parent").siblings().removeClass("nav-hover"), $(this).closest(".nav-parent").addClass("nav-hover")
        //}, function () {
        //    $(this), e = setTimeout(function () {
        //        $(this).closest(".nav-parent").removeClass("nav-hover")
        //    }, 200)
        //}), $("body").hasClass("sidebar-collapsed") && $(".nav-sidebar .children").css({display: ""}), $(".dropdown-menu").find("form").click(function (e) {
        //    e.stopPropagation()
        //}), I(), M(), R(), _(), W(), j(), P(), L(), O(), A(), G(), N(), U(), setTimeout(function () {
        //    w()
        //}, 100), $("body").hasClass("sidebar-hover") && sidebarHover()
    }

    function yy() {
        if ($('body').hasClass('sidebar-collapsed') || $('body').hasClass('sidebar-top') || $('body').hasClass('submenu-hover'))
            $('.nav-sidebar .children').css({
                display: ''
            });
        else $('.nav-active.active .children').css('display', 'block');
        $('.sidebar').on('click', '.nav-sidebar li.nav-parent > a', function (e) {
            e.preventDefault();
            //if ($('body').hasClass('sidebar-collapsed') && !$('body').hasClass('sidebar-hover')) return;
            //if ($('body').hasClass('submenu-hover')) return;
            var parent  = $(this).parent().parent();
            parent.children('li.active').children('.children').slideUp(200);
            $('.nav-sidebar .arrow').removeClass('active');
            parent.children('li.active').removeClass('active');
            var sub = $(this).next();
            if (sub.is(":visible")) {
                sub.children().addClass('hidden-item');
                $(this).parent().removeClass("active");
                sub.slideUp(200, function() {
                    sub.children().removeClass('hidden-item');
                });
            } else {
                $(this).find('.arrow').addClass('active');
                sub.children().addClass('is-hidden');
                setTimeout(function() {
                    sub.children().addClass('is-shown');
                }, 0);
                sub.slideDown(200, function() {
                    $(this).parent().addClass("active");
                    setTimeout(function() {
                        sub.children().removeClass('is-hidden').removeClass('is-shown');
                    }, 500);
                });
            }
        });
        $('.sidebar').on('click', '.nav-sidebar li.nav-only > a', function(e) {
            var active = $('.nav-sidebar li.nav-parent.active'), self = $(this);
            $('.nav-sidebar li.nav-only').removeClass('active');
            setTimeout(function() {
                self.parent().addClass('active');
            }, 50);
            if (active.length) {
                active.find('.arrow').removeClass('active');
                var sub = active.find('ul.children');
                if (sub.is(':visible')) {
                    sub.slideUp(200, function() {
                        setTimeout(function() {
                            active.removeClass('active');
                            sub.removeClass('hidden-item');
                        }, 200);
                    });
                }
            }
            if (mobileAndTabletcheck()) {
                $('.sidebar').fadeOut('slow');
            }
        });
    }

    $(window).load(function () {
        "use strict";
        setTimeout(function () {
            $(".loader-overlay").addClass("loaded"), $("body > section").animate({opacity: 1}, 400)
        }, 500)
    }), $(window).resize(function () {
        setTimeout(function () {
            R(), j(), $("body").hasClass("fixed-sidebar") || $("body").hasClass("builder-admin") || N(), w(), H()
        }, 100)
    });
    var Z = {};
    return Z.init = Y, Z.toggleRTL = i, Z.handleSidebarFluid = o, Z.handleSidebarSortable = _, Z.handleSidebarHide = L, Z.handleSidebarRemove = P, Z.customScroll = R, Z.handleSidebarFixed = s, Z.handleTopbarFixed = b, Z.handleTopbarFluid = v, Z.createSidebarHover = c, Z.removeSidebarHover = h, Z.createSubmenuHover = p, Z.removeSubmenuHover = m, Z.createSidebarTop = n, Z.removeSidebarTop = l, Z.createBoxedLayout = C, Z.removeBoxedLayout = y, Z.resetStyle = z, Z.disableRTL = a, Z.enableRTL = t, Z.toggleSidebar = r, Z.toggleSubmenuHover = f, Z.collapsedSidebar = x, Z.toggleSidebarTop = d, Z.toggleSidebarHover = u, Z.toggleboxedLayout = k, Z.toggleTopbar = g, Z.handlePanelAction = A, Z
}]), angular.module("newApp").factory("pluginsService", [function () {
    function e() {
        $(".color-picker").length && $.fn.spectrum && $(".color-picker").each(function () {
            var e = "";
            $(this).data("palette") && (e = $(this).data("palette")), $(this).spectrum({
                color: $(this).data("min") ? $(this).data("min") : "#D15ADE",
                showInput: $(this).data("show-input") ? $(this).data("show-input") : !1,
                showPalette: $(this).data("show-palette") ? $(this).data("show-palette") : !1,
                showPaletteOnly: $(this).data("show-palette-only") ? $(this).data("show-palette-only") : !1,
                showAlpha: $(this).data("show-alpha") ? $(this).data("show-alpha") : !1,
                palette: $(this).data("palette") ? $(this).data("palette") : [[e]]
            }), $(this).show()
        })
    }

    function t() {
        $(".numeric-stepper").length && $.fn.TouchSpin && $(".numeric-stepper").each(function () {
            $(this).TouchSpin({
                min: $(this).data("min") ? $(this).data("min") : 0,
                max: $(this).data("max") ? $(this).data("max") : 100,
                step: $(this).data("step") ? $(this).data("step") : .1,
                decimals: $(this).data("decimals") ? $(this).data("decimals") : 0,
                boostat: $(this).data("boostat") ? $(this).data("boostat") : 5,
                maxboostedstep: $(this).data("maxboostedstep") ? $(this).data("maxboostedstep") : 10,
                verticalbuttons: $(this).data("vertical") ? $(this).data("vertical") : !1,
                buttondown_class: $(this).data("btn-before") ? "btn btn-" + $(this).data("btn-before") : "btn btn-default",
                buttonup_class: $(this).data("btn-after") ? "btn btn-" + $(this).data("btn-after") : "btn btn-default"
            })
        })
    }

    function a() {
        $(".portlets").length && $.fn.sortable && $(".portlets").sortable({
            connectWith: ".portlets",
            handle: ".panel-header",
            items: "div.panel",
            placeholder: "panel-placeholder",
            opacity: .5,
            dropOnEmpty: !0,
            forcePlaceholderSize: !0,
            receive: function () {
                $("body").trigger("resize")
            }
        })
    }

    function i() {
        $(".nestable").length && $.fn.nestable && $(".nestable").nestable()
    }

    function s() {
        $(".sortable_table").length && $.fn.sortable && $(".sortable_table").sortable({
            itemPath: "> tbody",
            itemSelector: "tbody tr",
            placeholder: '<tr class="placeholder"/>'
        })
    }

    function o() {
        $('[data-rel="tooltip"]').length && $.fn.tooltip && $('[data-rel="tooltip"]').tooltip()
    }

    function r() {
        $('[rel="popover"]').length && $.fn.popover && ($('[rel="popover"]').popover({trigger: "hover"}), $('[rel="popover_dark"]').popover({
            template: '<div class="popover popover-dark"><div class="arrow"></div><h3 class="popover-title popover-title"></h3><div class="popover-content popover-content"></div></div>',
            trigger: "hover"
        }))
    }

    function n() {
        $(".js-switch").length && setTimeout(function () {
            $(".js-switch").each(function () {
                var e = "#18A689", t = "#DFDFDF";
                $(this).data("color-on") && (e = $(this).data("color-on")), $(this).data("color-on") && (t = $(this).data("color-off")), "blue" == e && (e = "#56A2D5"), "red" == e && (e = "#C75757"), "yellow" == e && (e = "#F3B228"), "green" == e && (e = "#18A689"), "purple" == e && (e = "#8227f1"), "dark" == e && (e = "#292C35"), "blue" == t && (t = "#56A2D5"), "red" == t && (t = "#C75757"), "yellow" == t && (t = "#F3B228"), "green" == t && (t = "#18A689"), "purple" == t && (t = "#8227f1"), "dark" == t && (t = "#292C35"), new Switchery(this, {
                    color: e,
                    secondaryColor: t
                })
            })
        }, 500)
    }

    function l() {
        $(".slide-ios").length && $.fn.slider && $(".slide-ios").each(function () {
            $(this).sliderIOS()
        })
    }

    function d() {
        $(".range-slider").length && $.fn.ionRangeSlider && $(".range-slider").each(function () {
            $(this).ionRangeSlider({
                min: $(this).data("min") ? $(this).data("min") : 0,
                max: $(this).data("max") ? $(this).data("max") : 5e3,
                hideMinMax: $(this).data("hideMinMax") ? $(this).data("hideMinMax") : !1,
                hideFromTo: $(this).data("hideFromTo") ? $(this).data("hideFromTo") : !1,
                to: $(this).data("to") ? $(this).data("to") : "",
                step: $(this).data("step") ? $(this).data("step") : "",
                type: $(this).data("type") ? $(this).data("type") : "double",
                prefix: $(this).data("prefix") ? $(this).data("prefix") : "",
                postfix: $(this).data("postfix") ? $(this).data("postfix") : "",
                maxPostfix: $(this).data("maxPostfix") ? $(this).data("maxPostfix") : "",
                hasGrid: $(this).data("hasGrid") ? $(this).data("hasGrid") : !1
            })
        })
    }

    function c() {
    }

    function h() {
        function e(e) {
            var t = '<div class="row"><div class="col-md-2"><img class="img-responsive" src="' + e.owner.avatar_url + '" /></div><div class="col-md-10"><div class="row"><div class="col-md-6">' + e.full_name + '</div><div class="col-md-3"><i class="fa fa-code-fork"></i> ' + e.forks_count + '</div><div class="col-md-3"><i class="fa fa-star"></i> ' + e.stargazers_count + "</div></div>";
            return e.description && (t += "<div>" + e.description + "</div>"), t += "</div></div>"
        }

        function t(e) {
            return e.full_name
        }

        $.fn.select2 && (setTimeout(function () {
            $("select").each(function () {
                function e(e) {
                    var t = e.id;
                    if (!t)return e.text;
                    var a = t.split("-");
                    return "image" == a[0] ? a[2] ? "<img class='flag' src='../images/flags/" + a[1].toLowerCase() + "-" + a[2].toLowerCase() + ".png' style='width:27px;padding-right:10px;margin-top: -3px;'/>" + e.text : "<img class='flag' src='../images/flags/" + a[1].toLowerCase() + ".png' style='width:27px;padding-right:10px;margin-top: -3px;'/>" + e.text : e.text
                }

                $(this).select2({
                    formatResult: e,
                    formatSelection: e,
                    placeholder: $(this).data("placeholder") ? $(this).data("placeholder") : "",
                    allowClear: $(this).data("allowclear") ? $(this).data("allowclear") : !0,
                    minimumInputLength: $(this).data("minimumInputLength") ? $(this).data("minimumInputLength") : -1,
                    minimumResultsForSearch: $(this).data("search") ? 1 : -1,
                    dropdownCssClass: $(this).data("style") ? "form-white" : ""
                })
            })
        }, 200), $("#demo-loading-data").length && $("#demo-loading-data").select2({
            placeholder: "Search for a repository",
            minimumInputLength: 1,
            ajax: {
                url: "https://api.github.com/search/repositories",
                dataType: "json",
                quietMillis: 250,
                data: function (e) {
                    return {q: e}
                },
                results: function (e) {
                    return {results: e.items}
                },
                cache: !0
            },
            initSelection: function (e, t) {
                var a = $(e).val();
                "" !== a && $.ajax("https://api.github.com/repositories/" + a, {dataType: "json"}).done(function (e) {
                    t(e)
                })
            },
            formatResult: e,
            formatSelection: t,
            dropdownCssClass: "bigdrop",
            escapeMarkup: function (e) {
                return e
            }
        }))
    }

    function u() {
        $(".select-tags").each(function () {
            $(this).tagsinput({tagClass: "label label-primary"})
        })
    }

    function p() {
        setTimeout(function () {
            $(".table").each(function () {
                window_width = $(window).width(), table_width = $(this).width(), content_width = $(this).parent().width(), table_width > content_width ? $(this).parent().addClass("force-table-responsive") : $(this).parent().removeClass("force-table-responsive")
            })
        }, 200)
    }

    function m() {
        $(".table-dynamic").length && $.fn.dataTable && $(".table-dynamic").each(function () {
            var e = {};
            if ($(this).hasClass("table-tools") && (e.sDom = "<'row'<'col-md-6'f><'col-md-6'T>r>t<'row'<'col-md-6'i><'spcol-md-6an6'p>>", e.oTableTools = {
                    sSwfPath: "../../../assets/global/plugins/datatables/swf/copy_csv_xls_pdf.swf",
                    aButtons: ["csv", "xls", "pdf", "print"]
                }), $(this).hasClass("no-header") && (e.bFilter = !1, e.bLengthChange = !1), $(this).hasClass("no-footer") && (e.bInfo = !1, e.bPaginate = !1), $(this).hasClass("filter-head")) {
                $(".filter-head thead th").each(function () {
                    var e = $(".filter-head thead th").eq($(this).index()).text();
                    $(this).append('<input type="text" onclick="stopPropagation(event);" class="form-control" placeholder="Filter ' + e + '" />')
                });
                var t = $(".filter-head").DataTable();
                $(".filter-head thead input").on("keyup change", function () {
                    t.column($(this).parent().index() + ":visible").search(this.value).draw()
                })
            }
            if ($(this).hasClass("filter-footer")) {
                $(".filter-footer tfoot th").each(function () {
                    var e = $(".filter-footer thead th").eq($(this).index()).text();
                    $(this).html('<input type="text" class="form-control" placeholder="Filter ' + e + '" />')
                });
                var t = $(".filter-footer").DataTable();
                $(".filter-footer tfoot input").on("keyup change", function () {
                    t.column($(this).parent().index() + ":visible").search(this.value).draw()
                })
            }
            if ($(this).hasClass("filter-select") && $(this).DataTable({
                    initComplete: function () {
                        var e = this.api();
                        e.columns().indexes().flatten().each(function (t) {
                            var a = e.column(t), i = $('<select class="form-control" data-placeholder="Select to filter"><option value=""></option></select>').appendTo($(a.footer()).empty()).on("change", function () {
                                var e = $(this).val();
                                a.search(e ? "^" + e + "$" : "", !0, !1).draw()
                            });
                            a.data().unique().sort().each(function (e) {
                                i.append('<option value="' + e + '">' + e + "</option>")
                            })
                        })
                    }
                }), !$(this).hasClass("filter-head") && !$(this).hasClass("filter-footer") && !$(this).hasClass("filter-select")) {
                var a = $(this).dataTable(e);
                a.fnDraw()
            }
        })
    }

    function f() {
        $().iCheck && $(":checkbox:not(.js-switch, .switch-input, .switch-iphone, .onoffswitch-checkbox, .ios-checkbox), :radio").each(function () {
            var e = $(this).attr("data-checkbox") ? $(this).attr("data-checkbox") : "icheckbox_minimal-grey", t = $(this).attr("data-radio") ? $(this).attr("data-radio") : "iradio_minimal-grey";
            $(this).iCheck(e.indexOf("_line") > -1 || t.indexOf("_line") > -1 ? {
                checkboxClass: e,
                radioClass: t,
                insert: '<div class="icheck_line-icon"></div>' + $(this).attr("data-label")
            } : {checkboxClass: e, radioClass: t})
        })
    }

    function b() {
        $(".timepicker").each(function () {
            $(this).timepicker({
                isRTL: $("body").hasClass("rtl") ? !0 : !1,
                timeFormat: $(this).attr("data-format", "am-pm") ? "hh:mm tt" : "HH:mm"
            })
        })
    }

    function v() {
        $(".date-picker").each(function () {
            $(this).datepicker({
                numberOfMonths: 1,
                isRTL: $("body").hasClass("rtl") ? !0 : !1,
                prevText: '<i class="fa fa-angle-left"></i>',
                nextText: '<i class="fa fa-angle-right"></i>',
                showButtonPanel: !1
            })
        })
    }

    function g() {
        $(".b-datepicker").each(function () {
            $(this).bootstrapDatepicker({
                startView: $(this).data("view") ? $(this).data("view") : 0,
                language: $(this).data("lang") ? $(this).data("lang") : "en",
                forceParse: $(this).data("parse") ? $(this).data("parse") : !1,
                daysOfWeekDisabled: $(this).data("day-disabled") ? $(this).data("day-disabled") : "",
                calendarWeeks: $(this).data("calendar-week") ? $(this).data("calendar-week") : !1,
                autoclose: $(this).data("autoclose") ? $(this).data("autoclose") : !1,
                todayHighlight: $(this).data("today-highlight") ? $(this).data("today-highlight") : !0,
                toggleActive: $(this).data("toggle-active") ? $(this).data("toggle-active") : !0,
                multidate: $(this).data("multidate") ? $(this).data("multidate") : !1,
                orientation: $(this).data("orientation") ? $(this).data("orientation") : "auto",
                rtl: $("html").hasClass("rtl") ? !0 : !1
            })
        })
    }

    function w() {
        $(".multidatepicker").each(function () {
            $(this).multiDatesPicker({
                dateFormat: "yy-mm-dd",
                minDate: new Date,
                maxDate: "+1y",
                firstDay: 1,
                showOtherMonths: !0
            })
        })
    }

    function C() {
        $(".rateit").each(function () {
            if ($(this).rateit({
                    readonly: $(this).data("readonly") ? $(this).data("readonly") : !1,
                    resetable: $(this).data("resetable") ? $(this).data("resetable") : !1,
                    value: $(this).data("value") ? $(this).data("value") : 0,
                    min: $(this).data("min") ? $(this).data("min") : 1,
                    max: $(this).data("max") ? $(this).data("max") : 5,
                    step: $(this).data("step") ? $(this).data("step") : .1
                }), $(this).data("tooltip")) {
                var e = ["bad", "poor", "ok", "good", "super"];
                $(this).bind("over", function (t, a) {
                    $(this).attr("title", e[a - 1])
                })
            }
            $(this).data("confirmation") && $(this).on("beforerated", function (e, t) {
                t = t.toFixed(1), confirm("Are you sure you want to rate this item: " + t + " stars?") ? $(this).rateit("readonly", !0) : e.preventDefault()
            }), $(this).data("disable-after") && $(this).bind("rated", function () {
                $(this).rateit("readonly", !0)
            }), $(this).parent().find(".rating-value") && $(this).bind("rated", function (e, t) {
                t && (t = t.toFixed(1)), $(this).parent().find(".rating-value").text("Your rating: " + t)
            }), $(this).parent().find(".hover-value") && $(this).bind("over", function (e, t) {
                t && (t = t.toFixed(1)), $(this).parent().find(".hover-value").text("Hover rating value: " + t)
            })
        })
    }

    function y() {
        $.fn.datetimepicker && ($(".datetimepicker").each(function () {
            $(this).datetimepicker({
                prevText: '<i class="fa fa-angle-left"></i>',
                nextText: '<i class="fa fa-angle-right"></i>'
            })
        }), $(".inline_datetimepicker").datetimepicker({altFieldTimeOnly: !1, isRTL: is_RTL}))
    }

    function k() {
        $(".magnific").length && $.fn.magnificPopup && $(".magnific").magnificPopup({
            type: "image",
            gallery: {enabled: !0},
            removalDelay: 300,
            mainClass: "mfp-fade"
        })
    }

    function x() {
        $(".summernote").length && $.fn.summernote && $(".summernote").each(function () {
            $(this).summernote({
                height: 300,
                airMode: $(this).data("airmode") ? $(this).data("airmode") : !1,
                airPopover: [["style", ["style"]], ["color", ["color"]], ["font", ["bold", "underline", "clear"]], ["para", ["ul", "paragraph"]], ["table", ["table"]], ["insert", ["link", "picture"]]],
                toolbar: [["style", ["style"]], ["style", ["bold", "italic", "underline", "clear"]], ["fontsize", ["fontsize"]], ["color", ["color"]], ["para", ["ul", "ol", "paragraph"]], ["height", ["height"]], ["table", ["table"]], ["view", ["codeview"]]]
            })
        })
    }

    function S() {
        $(".cke-editor").length && $.fn.ckeditor && ($(".cke-editor").each(function () {
            $(this).ckeditor()
        }), CKEDITOR.disableAutoInline = !0)
    }

    function T() {
        $(".slick").length && $.fn.slick && $(".slick").each(function () {
            $(this).slick({
                accessibility: !0,
                adaptiveHeight: !1,
                arrows: $(this).data("arrows") ? $(this).data("arrows") : !1,
                asNavFor: null,
                prevArrow: '<button type="button" data-role="none" class="slick-prev">Previous</button>',
                nextArrow: '<button type="button" data-role="none" class="slick-next">Next</button>',
                autoplay: $(this).attr("data-autoplay") ? $(this).attr("data-autoplay") : !0,
                autoplaySpeed: $(this).data("timing") ? $(this).data("timing") : 4e3,
                centerMode: $(this).data("center") ? $(this).data("center") : !1,
                centerPadding: "50px",
                cssEase: "ease",
                dots: $(this).attr("data-dots") ? $(this).attr("data-dots") : !0,
                dotsClass: "slick-dots",
                draggable: !0,
                easing: "linear",
                fade: $(this).data("fade") ? $(this).data("fade") : !1,
                focusOnSelect: !1,
                infinite: !0,
                lazyLoad: "ondemand",
                onBeforeChange: null,
                onAfterChange: null,
                onInit: null,
                onReInit: null,
                pauseOnHover: !0,
                pauseOnDotsHover: !1,
                responsive: null,
                rtl: $("body").hasClass("rtl") ? !0 : !1,
                slide: ".slide",
                slidesToShow: $(this).data("num-slides") ? $(this).data("num-slides") : 1,
                slidesToScroll: $(this).data("num-scroll") ? $(this).data("num-scroll") : 1,
                speed: 500,
                swipe: !0,
                swipeToSlide: !1,
                touchMove: !0,
                touchThreshold: 5,
                useCSS: !0,
                variableWidth: $(this).data("variable-width") ? !0 : !1,
                vertical: !1,
                waitForAnimate: !0
            })
        })
    }

    function z() {
        $(".wizard").length && $.fn.stepFormWizard && ($(".wizard").each(function () {
            $this = $(this), $(this).data("initiated") || ($(this).stepFormWizard({
                theme: $(this).data("style") ? $(this).data("style") : "circle",
                showNav: $(this).data("nav") ? $(this).data("nav") : "top",
                height: "auto",
                rtl: $("body").hasClass("rtl") ? !0 : !1,
                onNext: function (e, t) {
                    return $this.hasClass("wizard-validation") ? $("form", t).parsley().validate("block" + e) : void 0
                },
                onFinish: function () {
                    return $this.hasClass("wizard-validation") ? $("form", wizard).parsley().validate() : void 0
                }
            }), $(this).data("initiated", !0))
        }), $("#validation .wizard .sf-btn").on("click", function () {
            setTimeout(function () {
                $(window).resize(), $(window).trigger("resize")
            }, 50)
        }))
    }

    function F() {
        $(".form-validation").length && $.fn.validate && ($.validator.methods.operation = function (e, t, a) {
            return e == a
        }, $.validator.methods.customemail = function (e) {
            return /^([-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,4})+$/.test(e)
        }, $(".form-validation").each(function () {
            var e = $(this).validate({
                success: "valid",
                submitHandler: function () {
                    alert("Form is valid! We submit it")
                },
                errorClass: "form-error",
                validClass: "form-success",
                errorElement: "div",
                ignore: [],
                rules: {
                    avatar: {extension: "jpg|png|gif|jpeg|doc|docx|pdf|xls|rar|zip"},
                    password2: {equalTo: "#password"},
                    calcul: {operation: 12},
                    url: {url: !0},
                    email: {
                        required: {
                            depends: function () {
                                return $(this).val($.trim($(this).val())), !0
                            }
                        }, customemail: !0
                    }
                },
                messages: {
                    name: {required: "Enter your name"},
                    lastname: {required: "Enter your last name"},
                    firstname: {required: "Enter your first name"},
                    email: {required: "Enter email address", customemail: "Enter a valid email address"},
                    language: {required: "Enter your language"},
                    mobile: {required: "Enter your phone number"},
                    avatar: {required: "You must upload your avatar"},
                    password: {required: "Write your password"},
                    password2: {required: "Write your password", equalTo: "2 passwords must be the same"},
                    calcul: {required: "Enter the result of 4 + 8", operation: "Result is false. Try again!"},
                    terms: {required: "You must agree with terms"}
                },
                highlight: function (e, t, a) {
                    $(e).closest(".form-control").addClass(t).removeClass(a)
                },
                unhighlight: function (e, t, a) {
                    $(e).closest(".form-control").removeClass(t).addClass(a)
                },
                errorPlacement: function (e, t) {
                    t.hasClass("custom-file") || t.hasClass("checkbox-type") || t.hasClass("language") ? t.closest(".option-group").after(e) : t.is(":radio") || t.is(":checkbox") ? t.closest(".option-group").after(e) : t.parent().hasClass("input-group") ? t.parent().after(e) : e.insertAfter(t)
                },
                invalidHandler: function (e, t) {
                    t.numberOfInvalids()
                }
            });
            $(".form-validation .cancel").click(function () {
                e.resetForm()
            })
        }))
    }

    function D() {
        $(".live-tile").length && $.fn.liveTile && $(".live-tile").each(function () {
            $(this).liveTile("destroy", !0), tile_height = $(this).data("height") ? $(this).data("height") : $(this).find(".panel-body").height() + 52, $(this).height(tile_height), $(this).liveTile({
                speed: $(this).data("speed") ? $(this).data("speed") : 500,
                mode: $(this).data("animation-easing") ? $(this).data("animation-easing") : "carousel",
                playOnHover: $(this).data("play-hover") ? $(this).data("play-hover") : !1,
                repeatCount: $(this).data("repeat-count") ? $(this).data("repeat-count") : -1,
                delay: $(this).data("delay") ? $(this).data("delay") : 0,
                startNow: $(this).data("start-now") ? $(this).data("start-now") : !0
            })
        })
    }

    function E() {
        $(".bar-stats").length && $(".bar-stats").each(function () {
            var e = function () {
                return Math.round(100 * Math.random())
            }, t = ["#C9625F", "#18A689", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#8085e8", "#91e8e1"], a = t[Math.floor(Math.random() * t.length)], i = {
                labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
                datasets: [{
                    fillColor: a,
                    strokeColor: a,
                    highlightFill: "#394248",
                    highlightStroke: "#394248",
                    data: [e(), e(), e(), e(), e(), e(), e(), e(), e(), e(), e(), e()]
                }]
            }, s = $(this).get(0).getContext("2d");
            window.myBar = new Chart(s).Bar(i, {
                responsive: !0,
                scaleShowLabels: !1,
                showScale: !0,
                scaleLineColor: "rgba(0,0,0,.1)",
                scaleShowGridLines: !1
            })
        })
    }

    function q() {
        $(".countup").each(function () {
            from = $(this).data("from") ? $(this).data("from") : 0, to = $(this).data("to") ? $(this).data("to") : 100, duration = $(this).data("duration") ? $(this).data("duration") : 2, delay = $(this).data("delay") ? $(this).data("delay") : 1e3, decimals = $(this).data("decimals") ? $(this).data("decimals") : 0;
            var e = {
                useEasing: !0,
                useGrouping: !0,
                separator: ",",
                prefix: $(this).data("prefix") ? $(this).data("  prefix") : "",
                suffix: $(this).data("suffix") ? $(this).data("suffix") : ""
            }, t = new countUp($(this).get(0), from, to, decimals, duration, e);
            setTimeout(function () {
                t.start()
            }, delay)
        })
    }

    function A() {
        $("textarea.autosize").each(function () {
            $(this).autosize()
        })
    }

    return $(window).bind("resize", function () {
        window.resizeEvt, $(window).resize(function () {
            clearTimeout(window.resizeEvt), window.resizeEvt = setTimeout(function () {
                p()
            }, 250)
        })
    }), {
        inputSelect: h, sortablePortlets: a, init: function () {
            var H = (document, document.documentElement, $(".sidebar"), $(".main-content"), $(".sidebar").width(), !1);
            $("body").hasClass("rtl") && (H = !0);
            var R;
            $(".sortable").length && $.fn.sortable && $(".sortable").sortable({
                handle: ".panel-header",
                start: function (e, t) {
                    R = t.item.index(), t.placeholder.height(t.item.height() - 20)
                },
                stop: function (e, t) {
                    var a = t.item.index(), i = a > R, s = a + (i ? -1 : 1), o = $(".sortable > div"), r = o.get(s);
                    if (r) {
                        var n = $(o.get(R));
                        i ? $(r).insertBefore(n) : $(r).insertAfter(n)
                    }
                }
            }), a(), s(), i(), o(), r(), e(), t(), n(), l(), d(), c(), h(), u(), p(), m(), f(), b(), v(), g(), w(), y(), C(), k(), x(), S(), T(), D(), z(), F(), E(), q(), A()
        }
    }
}]), angular.module("newApp").factory("quickViewService", [function () {
    function e() {
        function e() {
            $("#quickview-toggle").click(function (e) {
                e.preventDefault(), e.stopPropagation(), $("#quickview-sidebar").hasClass("open") ? $("#builder").removeClass("open") : $("#quickview-sidebar").addClass("open")
            })
        }

        $(".chat-back").on("click", function () {
            $(".chat-conversation").removeClass("current"), $(".chat-body").addClass("current")
        }), $(".chat-list").on("click", "li", function () {
            var e = $(this).find(".user-name").html(), t = $(this).find(".user-txt").html(), a = $(this).find(".user-status").html(), i = $(this).find("img").attr("src");
            $(".chat-conversation .user-name").html(e), $(".chat-conversation .user-txt").html(t), $(".chat-conversation .user-status").html(a), $(".chat-conversation .user-img img").attr("src", i), $(".chat-conversation .conversation-body .conversation-img img").attr("src", i), $(".chat-body").removeClass("current"), $(".chat-conversation").addClass("current")
        }), $("#quickview-toggle").on("click", function () {
            $("#chat-notification").hide(), setTimeout(function () {
                $(".mm-panel .badge-danger").each(function () {
                    $(this).removeClass("hide").addClass("animated bounceIn")
                })
            }, 1e3)
        }), $(".have-message").on("click", function () {
            $(this).removeClass("have-message"), $(this).find(".badge-danger").fadeOut()
        }), $(".send-message").keypress(function (e) {
            if (13 == e.keyCode) {
                var a = '<li class="img"><span><div class="chat-detail chat-right"><img src="../images/avatars/avatar1.png" data-retina-src="../images/avatars/avatar1_2x.png"/><div class="chat-detail"><div class="chat-bubble">' + $(this).val() + "</div></div></div></span></li>";
                $(a).hide().appendTo($(this).parent().parent().parent().find(".conversation-body ul")).fadeIn(), $(this).val(""), t(), customScroll()
            }
        }), $(".main-content").click(function (e) {
            chatSidebar = document.getElementById("quickview-sidebar");
            var t = e.target;
            t !== chatSidebar && $("#quickview-sidebar").hasClass("open") && ($("#quickview-sidebar").addClass("closing"), $("#quickview-sidebar").removeClass("open"), setTimeout(function () {
                $("#quickview-sidebar").removeClass("closing")
            }, 400))
        }), $(".settings-chart .progress-bar").length && $(".settings-tab").on("click", function () {
            setTimeout(function () {
                $(".settings-chart .setting1").progressbar(), window.myRadar = new Chart(document.getElementById("setting-chart").getContext("2d")).Radar(a, {
                    responsive: !0,
                    tooltipCornerRadius: 0,
                    animationSteps: 60
                })
            }, 200), setTimeout(function () {
                $(".settings-chart .setting2").progressbar()
            }, 400)
        });
        var a = {
            labels: ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"],
            datasets: [{
                label: "My Second dataset",
                fillColor: "rgba(151,187,205,0.2)",
                strokeColor: "rgba(151,187,205,1)",
                pointColor: "rgba(151,187,205,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(151,187,205,1)",
                data: [38, 48, 40, 89, 96, 27, 90]
            }]
        };
        e()
    }

    function t() {
    }

    return $(window).resize(function () {
        t()
    }), {
        init: function () {
            e(), t(), $(".topnav .menutoggle").click(function (e) {
                e.preventDefault(), $(".sidebar").fadeToggle("slow", "linear")
            })
        }
    }
}]);

(function(){
    function decimalAdjust(type, value, exp) {
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }
    if (!Math.round10) {
        Math.round10 = function(value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    if (!Math.floor10) {
        Math.floor10 = function(value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    if (!Math.ceil10) {
        Math.ceil10 = function(value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();