// constants
var TRANSCRIPT_THRESHOLD        = 20;
var PERIOD                      = ". ";

var transcriptBuffer            = '';
var transcriptCount             = 0;
var isItReallyStopped           = false;

// Initialize the webkit speech recognition object
var recognition = new webkitSpeechRecognition();
recognition.continuous = false;         // *** IMPORTANT !! This helps us identify sentence boundaries in conversations
recognition.interimResults = false;
recognition.lang = "en-US";             // could be en-IN also
recognition.maxAlternatives = 1;

function startListening(){
  recognition.start();
}

function stopListening() {
  recognition.abort();
  isItReallyStopped = true;
}

recognition.onresult = function(event) {
    var thisSentence = event.results[0][0].transcript;
    var thisConfidence = event.results[0][0].confidence;

    transcriptBuffer += thisSentence + PERIOD;
    transcriptCount++;

    // TODO send for summarization if transcriptCount reaches TRANSCRIPT_THRESHOLD

    showThisSentence(thisSentence);
}

recognition.onend = function () {
    if (!isItReallyStopped) {
    // start listening again
    console.log('Inside onend... going to start listening again');
    start();
  }
}

function showThisSentence(thisSentence) {
  var thisSentenceDiv = document.createElement('div');
  thisSentenceDiv.innerText = thisSentence;
  document.getElementById('sentences').appendChild(thisSentenceDiv);
}