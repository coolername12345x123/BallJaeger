var currentScore = 0,
    currentTimer = 60,
    started = false,
    timer = null,
    currentMode = "normal";

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

// Returns the new position so spawnRedSquares can use it
function moveBall(selection) {
  var left = randomIntFromInterval(2, 75),
      top  = randomIntFromInterval(2, 75),
      size;

  if (currentMode === "hard") {
    var a = randomIntFromInterval(5, 25),
        b = randomIntFromInterval(5, 25);
    size = Math.min(a, b); // biased toward small
  } else {
    size = randomIntFromInterval(300,400);
  }

  $(selection).css({ left: left+"%", top: top+"%", height: size+"vw", width: size+"vw" });
  return { left: left, top: top, size: size };
}

// Uses the NEW ball position (not the transitioning DOM position)
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

// Mode select buttons
$(".mode-btn").click(function () {
  currentMode = $(this).data("mode");
  $(".mode-badge").text(currentMode === "hard" ? "Hard" : "Normal");
  $(".mode-select").hide();
  $(".game").show();
});

// Ball click
$(".ball").click(function (e) {
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

// Play Again → back to mode select
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