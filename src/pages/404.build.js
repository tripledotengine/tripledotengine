$(function(){
    var windowHeight = $(window).height();
    var windowWidth = $(window).width();
    var main = $("#main_body");    
    $("#main_body").css({ top: ((windowHeight / 2) - (main.height() / 2)) + "px",
                          left:((windowWidth / 2) - (main.width() / 2)) + "px" });
});