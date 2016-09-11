// constants
var TRANSCRIPT_THRESHOLD        = 20;
var SUMMARIZATION_FACTOR        = 0.15;
var PERIOD                      = ". ";
var SUMMARIZE_URI               = "/summarize";

var totalBuffer                 = '';
var transcriptBuffer            = '';
var transcriptCount             = 0;
var isItReallyStopped           = false;
var isStart                     = true;

var actionButton                = '';
var waveGraphic                 = '';

// Initialize the webkit speech recognition object
var recognition = new webkitSpeechRecognition();
recognition.continuous = false;         // *** IMPORTANT !! This helps us identify sentence boundaries in conversations
recognition.interimResults = false;
recognition.lang = "en-US";             // could be en-IN also
recognition.maxAlternatives = 1;

function init() {
    actionButton = document.getElementById("actionBtn");
    waveGraphic = document.getElementById("wave");
}

function toggle(button) {
    if(isStart) {
        // start listening for speech
        recognition.start();
    } else {
        // stop listening for speech
        recognition.abort();
        isItReallyStopped = true;
        // TODO final call to summarize and display
    }
    toggleWaveGraphicState();
    toggleButtonState();
    isStart = !isStart;
}

function toggleWaveGraphicState() {
    if (isStart) {
        waveGraphic.className = "start";
    } else {
        waveGraphic.className = "end";
    }
}

function toggleButtonState() {
    if (isStart) {
        actionButton.innerText = "Stop";
    } else {
        actionButton.innerText = "Start";
    }
}

function sendForSummarization() {
    var summarizePayload = {};
    summarizePayload.text = transcriptBuffer;

    summarizePayload.count = Math.ceil(transcriptCount * SUMMARIZATION_FACTOR);

    fetch(SUMMARIZE_URI, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(summarizePayload)
    }).then(function(response) {
        var jsonResponse = '';
        response.json().then(function(json) {
            jsonResponse = JSON.stringify(json);
            console.log(jsonResponse);
            displaySummary(jsonResponse);
        });
        totalBuffer += transcriptBuffer;
        transcriptBuffer = '';
        transcriptCount = 0;
    }).catch(function(error) {
        console.error('Request to summarize failed.', error);
    });
}

function displaySummary(summaries) {
    console.log(summaries);
    // TODO show on UI
}

recognition.onresult = function(event) {
    // get the transcript of the sentence just uttered
    var thisSentence = event.results[0][0].transcript;

    // append it to the transcript buffer with a PERIOD
    transcriptBuffer += thisSentence + PERIOD;
    transcriptCount++;

    // send all text in transcript buffer for summarization to server
    if (transcriptCount == TRANSCRIPT_THRESHOLD) {
        sendForSummarization();
    }
}

recognition.onend = function () {
    if (!isItReallyStopped) {
        // Is this just a speech-pause (due to sentence boundary)? If yes, start listening again
        console.log('Inside onend... going to start listening again');
        recognition.start();
    }
}

function showThisSentence(thisSentence) {
    var thisSentenceDiv = document.createElement('li');
    thisSentenceDiv.innerText = thisSentence;
    document.getElementById('sentences').appendChild(thisSentenceDiv);
}