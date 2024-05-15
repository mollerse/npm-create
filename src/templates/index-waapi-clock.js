let ctx, actx, W, H;

function frame() {
  ctx.save();
  ctx.fillStyle = "#ebebeb";
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

let t0, tP;
function loop() {
  let totalT = actx.currentTime - t0;
  let deltaT = actx.currentTime - (tP || 0);

  requestAnimationFrame(loop);
  if (tP && deltaT < 0.033) {
    return;
  }

  tP = actx.currentTime;

  frame(totalT);
}

function init() {
  let canvas = document.createElement("canvas");
  canvas.setAttribute("width", `${0.75 * window.innerWidth}px`);
  canvas.setAttribute("height", `${(9 / 16) * 0.75 * window.innerWidth}vw`);
  document.body.appendChild(canvas);
  ctx = canvas.getContext("2d");
  actx = new AudioContext();

  W = canvas.width;
  H = canvas.height;

  t0 = actx.currentTime;

  let start = document.createElement("button");
  start.addEventListener("click", function () {
    if (actx.state === "suspended") {
      t0 = actx.currentTime;
      actx.resume();
      start.innerText = "Pause";
    }

    if (actx.state === "running") {
      actx.suspend();
      start.innerText = "Play";
    }
  });
  start.innerText = "Play";
  document.body.appendChild(start);

  frame(0);
}

init();
loop();
