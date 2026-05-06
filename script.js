var currentScore = 0,
    currentTimer = 60,
    started = false,
    timer = null,
    currentMode = "normal";

// --- AUDIO SETUP ---
var clickSound = new Audio("click.mp3");
var audioCtx = null;
var gainNode = null;

// This function sets up the "Booster" to hit 200% volume
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var source = audioCtx.createMediaElementSource(clickSound);
    gainNode = audioCtx.createGain();
    
    gainNode.gain.value = 2; // This is your 200% volume boost
    
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
  }
  // Browsers require a user gesture to start audio
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playClick() {
  initAudio();
  clickSound.currentTime = 0; // Resets sound so you can click fast
  clickSound.play();
}
// --------------------

var modeConfig = {
  normal: { min: 2, max: 5 },
  hard:   { min: 5, max: 10 }
};

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function incrementScore() {
  currentScore++;
  $(".score").html(currentScore);
}

function moveBall(selection) {
  var left = randomIntFromInterval(2, 75),
      top  = randomIntFromInterval(2, 75),
      size;

  if (currentMode === "hard") {
    var a = randomIntFromInterval(5, 15),
        b = randomIntFromInterval(5, 15);
    size = Math.min(a, b); 
  } else {
    size = randomIntFromInterval(8, 12); // Kept it smaller as we discussed
  }

  $(selection).css({ left: left+"%", top: top+"%", height: size+"vmin", width: size+"vmin" });
  return { left: left, top: top, size: size };
}

function spawnRedSquares(mouseX, mouseY, newBallPos) {
  $(".red-square").remove();
  var cfg   = modeConfig[currentMode];
  var count = randomIntFromInterval(cfg.min, cfg.max);
  var attempts = 0;

  var ballPxLeft = (newBallPos.left / 100) * window.innerWidth;
  var ballPxTop  = (newBallPos.top  / 100) * window.innerHeight;
  var ballPxSize = (newBallPos.size / 100) * window.innerWidth;

  while ($(".red-square").length < count && attempts < 150) {
    attempts++;
    var left = randomIntFromInterval(2, 75),
        top  = randomIntFromInterval(2, 75),
        size = randomIntFromInterval(8, 20);
    var pxLeft = (left / 100) * window.innerWidth,
        pxTop  = (top  / 100) * window.innerHeight,
        pxSize = (size / 100) * window.innerWidth;

    var overlapMouse = (mouseX >= pxLeft && mouseX <= pxLeft + pxSize &&
                        mouseY >= pxTop  && mouseY <= pxTop  + pxSize);
    var overlapBall  = !(pxLeft + pxSize < ballPxLeft ||
                         pxLeft > ballPxLeft + ballPxSize ||
                         pxTop  + pxSize < ballPxTop  ||
                         pxTop  > ballPxTop  + ballPxSize);

    if (overlapMouse || overlapBall) continue;

    $("<div class='red-square'></div>").css({
      left: left+"%", top: top+"%", width: size+"vw", height: size+"vw"
    }).appendTo(".game");
  }
}

function endGame() {
  $(".ball").addClass("end").hide();
  $(".red-square").remove();
  $(".score").html("Verloren! <br/>Punkte: " + currentScore);
  clearInterval(timer);
  $(".restart-btn").show();
}

function timerStart() {
  timer = setInterval(function () {
    currentTimer--;
    $(".timer").html(currentTimer);
    if (currentTimer < 1) { clearInterval(timer); endGame(); }
  }, 1000);
}

$(".mode-btn").click(function () {
  currentMode = $(this).data("mode");
  $(".mode-badge").text(currentMode === "hard" ? "Hard" : "Normal");
  $(".mode-select").hide();
  $(".game").show();
});

// --- UPDATED CLICK HANDLER ---
$(".ball").click(function (e) {
  playClick(); // Plays the sound
  incrementScore();
  var newPos = moveBall($(this));
  spawnRedSquares(e.clientX, e.clientY, newPos);
});

$(".start").click(function () {
  if (!started) { started = true; timerStart(); }
});

$(document).on("mouseenter", ".red-square", function () {
  if (started) endGame();
});

$(".restart-btn").click(function () {
  currentScore = 0;
  currentTimer = 60;
  started = false;
  clearInterval(timer);
  $(".score").html(0);
  $(".timer").html(60);
  $(".ball").removeClass("end").addClass("start").show();
  $(".red-square").remove();
  $(".restart-btn").hide();
  $(".game").hide();
  $(".mode-select").show();
});