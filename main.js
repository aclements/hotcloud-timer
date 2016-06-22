"use strict";

var timerDiv, progressDiv;
var ding = new Audio("ding.mp3");

$(document).ready(function() {
    timerDiv = $("#timer");
    progressDiv = $("#progress");

    function toggle() {
        if (running) {
            stop();
        } else {
            start();
        }
    }

    reset(15*60*1000, true);
    timerDiv.click(toggle);
    $("#pause").click(toggle);

    var barDiv = $("#bar");
    barDiv.click(function(ev) {
        var wasRunning = running;
        if (running)
            stop();
        // XXX Ugh, what 16?
        var relX = ev.pageX - $(this).parent().offset().left - 16;
        var pos = Math.min(Math.max(relX / barDiv.width(), 0), 1);
        timerValue = Math.floor(initTime * (1 - pos));
        lastWarning = timerValue;
        update();
        if (wasRunning)
            start();
    });

    $("#reset-talk").click(function() {
        reset(15*60*1000, true);
        start();
    });
    $("#reset-discuss").click(function() {
        reset(8*60*1000, false);
        start();
    });
    $("#test-ding").click(function() {
        ding.play();
    });
    ding.load();
});

// If running is true, zeroTime is the millisecond time at which the
// timer should reach zero. If running is false, timerValue is the
// current timer value in milliseconds remaining.
var running = false;
var timerValue, initTime;
var zeroTime;
var warningValues = [], lastWarning = 0;

var timerInterval;

function reset(ms, warnings) {
    if (running)
        stop();
    initTime = ms;
    timerValue = ms;
    lastWarning = ms;

    if (warnings) {
        $(".time-warning").show();
        warningValues = [5*60*1000, 1*60*1000, 0];
    } else {
        $(".time-warning").hide();
        warningValues = [0];
    }

    update();
}

function msToString(ms) {
    var secs = Math.floor(ms / 1000);
    var text = Math.floor(Math.abs(secs) / 60) + ":";
    if (secs < 0)
        text = "-" + text;
    var left = Math.abs(secs) % 60;
    if (left < 10)
        text += "0";
    text += left;
    return text;
}

function update() {
    var val;
    if (running)
        val = zeroTime - Date.now();
    else
        val = timerValue;

    timerDiv.text(msToString(val));

    if (val <= 0)
        progressDiv.css("width", "100%");
    else if (val >= initTime)
        progressDiv.css("width", "0%");
    else
        progressDiv.css("width", 100*(1 - val / initTime) + "%");

    var warning = false;
    for (var i = 0; i < warningValues.length; i++) {
        var w = warningValues[i];
        if (lastWarning > w && w >= val) {
            warning = true;
            break
        }
    }
    lastWarning = val;
    if (warning) {
        ding.play();
        var count = 8;
        var blink = window.setInterval(function() {
            if (count % 2 == 0)
                timerDiv.css("visibility", "hidden");
            else
                timerDiv.css("visibility", "visible");
            count--;
            if (count == 0)
                clearInterval(blink);
        }, 500);
    }
}

function start() {
    if (running)
        return;

    $("#pause").text("Pause").addClass("btn-info");

    // Switch from timerValue to zeroTime.
    zeroTime = Date.now() + timerValue;
    running = true;

    // TODO: Use a computed time out instead.
    timerInterval = window.setInterval(function() {
        if (window.requestAnimationFrame)
            window.requestAnimationFrame(update);
        else
            update();
    }, 100);
}

function stop() {
    if (!running)
        return;

    $("#pause").text("Resume").removeClass("btn-info");

    clearInterval(timerInterval);

    // Switch from zeroTime to timerValue.
    running = false;
    timerValue = zeroTime - Date.now();
    update();
}
