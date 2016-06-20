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
        // XXX Ugh, what 16?
        var relX = ev.pageX - $(this).parent().offset().left - 16;
        var pos = Math.min(Math.max(relX / barDiv.width(), 0), 1);
        console.log(relX, pos);
        timerValue = Math.floor(startValue * (1 - pos));
        lastWarning = timerValue;
        update();
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
var timerValue, startValue;
var warningValues = [], lastWarning = 0;

function reset(sec, warnings) {
    if (running)
        stop();
    timerValue = sec;
    startValue = sec;
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
    var text = Math.floor(Math.abs(timerValue) / 60) + ":";
    if (timerValue < 0)
        text = "-" + text;
    var secs = Math.abs(timerValue) % 60;
    if (secs < 10)
        text += "0";
    text += secs;
    timerDiv.text(text);

    if (timerValue <= 0)
        progressDiv.css("width", "100%");
    else if (timerValue >= startValue)
        progressDiv.css("width", "0%");
    else
        progressDiv.css("width", 100*(1 - timerValue / startValue) + "%");

    var warning = false;
    for (var i = 0; i < warningValues.length; i++) {
        var w = warningValues[i];
        if (lastWarning > w && w >= timerValue) {
            warning = true;
            break
        }
    }
    lastWarning = timerValue;
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
    timerInterval = window.setInterval(function() {
        timerValue--;
        update();
    }, 1000);
    running = true;
}

function stop() {
    clearInterval(timerInterval);
    running = false;
}
