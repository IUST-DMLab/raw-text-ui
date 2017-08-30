var app = angular.module('rawTextApp', ['ngRoute', 'ngMaterial', 'ngAnimate', 'ngAria',
    'ngMessages', 'ngCookies', 'ngMdIcons', 'ngSanitize', 'ngStorage'])
    .config(function ($mdIconProvider) {
        $mdIconProvider
            .icon('file:back', 'node_modules/ionicons/dist/svg/ios-arrow-back.svg', 24)
            .icon('file:folder', 'node_modules/ionicons/dist/svg/md-folder.svg', 24)
            .icon('file:text', 'node_modules/ionicons/dist/svg/md-document.svg', 24);
    });

function getParameterByName(name, url) {
    if (!url) {
        url = window.location.href;
    }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

var OUC = {
    isEmpty: function (obj) {
        return obj == undefined || obj == null;
    }
};
