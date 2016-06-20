"use strict";

var timerDiv, progressDiv;
var running = false;
var ding = new Audio("ding.mp3");

$(document).ready(function() {
    timerDiv = $("#timer");
    progressDiv = $("#progress");

    reset(15*60, true);
    timerDiv.click(function() {
        if (running) {
            stop();
        } else {
            start();
        }
    });

    var barDiv = $("#bar");
    barDiv.click(function(ev) {
        var wasRunning = running;
        if (running)
            stop();
        // XXX Ugh, what 16?
        var relX = ev.pageX - $(this).parent().offset().left - 16;
        var pos = Math.min(Math.max(relX / barDiv.width(), 0), 1);
        timerValue = Math.floor(initSecs * (1 - pos));
        lastWarning = timerValue;
        update();
        if (wasRunning)
            start();
    });

    $("#reset-talk").click(function() {
        reset(15*60, true);
        start();
    });
    $("#reset-discuss").click(function() {
        reset(8*60, false);
        start();
    });
    $("#test-ding").click(function() {
        ding.play();
    });
    ding.load();
});

var timerInterval;
var timerValue, initSecs;
var zeroTime;
var warningValues = [], lastWarning = 0;

function reset(sec, warnings) {
    if (running)
        stop();
    initSecs = sec;
    timerValue = sec;
    lastWarning = sec;

    if (warnings) {
        $(".time-warning").show();
        warningValues = [5*60, 1*60, 0];
    } else {
        $(".time-warning").hide();
        warningValues = [0];
    }

    update();
}

function update() {
    var val;
    if (running)
        val = zeroTime - (Date.now() / 1000);
    else
        val = timerValue;
    val = Math.round(val);

    var text = Math.floor(Math.abs(val) / 60) + ":";
    if (val < 0)
        text = "-" + text;
    var secs = Math.abs(val) % 60;
    if (secs < 10)
        text += "0";
    text += secs;
    timerDiv.text(text);

    if (val <= 0)
        progressDiv.css("width", "100%");
    else if (val >= initSecs)
        progressDiv.css("width", "0%");
    else
        progressDiv.css("width", 100*(1 - val / initSecs) + "%");

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

    // Switch from timerValue to zeroTime.
    zeroTime = Date.now() / 1000 + timerValue;
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

    clearInterval(timerInterval);

    // Switch from zeroTime to timerValue.
    running = false;
    timerValue = zeroTime - Date.now() / 1000;
    update();
}
