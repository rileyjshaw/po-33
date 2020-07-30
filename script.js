const { Sortable } = window.Draggable;

function updateUI() {
  updatePadNames();
  updateTotalSampleLength();
  updateSettingsInputs();
  updateSettingsLink();
}

function updatePadNames() {
  pads.forEach(
    (pad, i) =>
      (pad.querySelector("button").textContent = settings.padNames[i] || "*")
  );
}

function updateTotalSampleLength() {
  const length = parseFloat(
    sources
      .filter(x => x)
      .reduce(
        (a, b, i) =>
          a +
          Math.min(settings.maxMs / 1000, b.buffer.duration / settings.speed) +
          (i ? settings.gapMs / 1000 : 0),
        0
      )
      .toFixed(1)
  );
  sampleLengthContainer.textContent = length;
  secondsContainer.textContent = length === 1 ? "second" : "seconds";
}

function updateSettingsInputs() {
  ["speed", "maxMs", "gapMs"].forEach(
    (setting, i) => (settingsInputs[i].value = settings[setting])
  );
  settingsInputs[3].value = settings.padNames
    .map(name => name.replace(/,/g, "\\,"))
    .join(", ");
}

function updateSettingsLink() {
  const { location } = window;
  document.querySelector(".settings-link").href = `${location.origin}${
    location.pathname
  }?speed=${settings.speed}&maxMs=${settings.maxMs}&gapMs=${
    settings.gapMs
  }&padNames=${encodeURIComponent(
    settings.padNames.map(name => name.replace(/,/g, "\\,")).join(",")
  )}`;
}

const urlParams = new URLSearchParams(window.location.search);
const settings = {
  speed: parseFloat(urlParams.get("speed")) || 1,
  maxMs: parseFloat(urlParams.get("maxMs")) || 2147483647,
  gapMs: parseFloat(urlParams.get("gapMs")) || 0,
  padNames: decodeURIComponent(
    urlParams.get("padNames") || "bd,sn,ho,hc,bd,sn,ho,hc,bd,sn,*,cy"
  )
    .split(/(?<!\\),/)
    .map(name => name.replace(/\\,/g, ","))
};

const pads = Array.from({ length: 16 }, (_, i) => {
  const li = document.createElement("li");
  li.className = "empty";
  const input = document.createElement("input");
  const button = document.createElement("button");
  input.setAttribute("type", "file");
  input.setAttribute("accept", "audio/*");
  input.setAttribute("multiple", "");
  input.addEventListener("change", () => {
    if (input.files) {
      processFiles(input.files, i);
    }
  });
  li.append(input);
  li.append(button);
  return li;
});
const sampler = document.querySelector(".sampler-pane");
const container = document.createElement("ol");
container.className = "pads";
container.append(...pads);
const playButtonWrapper = document.createElement("div");
playButtonWrapper.id = "play-button-wrapper";
const playButton = document.createElement("button");
playButton.className = "play-all";
const sortable = new Sortable(container, {
  draggable: ".pads li",
  distance: 10
});

const settingsInputs = document.querySelectorAll(".settings input");
["speed", "maxMs", "gapMs"].forEach((setting, i) => {
  settingsInputs[i].addEventListener("change", e => {
    settings[setting] = +e.target.value;
    updateTotalSampleLength();
    updateSettingsLink();
  });
});
settingsInputs[3].addEventListener("change", e => {
  settings.padNames = e.target.value
    .replace(/ /g, "")
    .split(/(?<!\\),/)
    .map(name => name.replace(/\\,/g, ","));
  updatePadNames();
  updateSettingsLink();
});

const infoBox = document.createElement("div");
infoBox.className = "info-box";
const sampleLengthContainer = document.createElement("span");
sampleLengthContainer.innerText = "0";
const secondsContainer = document.createElement("span");
secondsContainer.innerText = "seconds";
infoBox.append(
  sampleLengthContainer,
  document.createTextNode(" "),
  secondsContainer
);

let draggedOut;
sortable.on("drag:over:container", e => {
  draggedOut = false;
});
sortable.on("drag:out:container", e => {
  draggedOut = true;
});
sortable.on("sortable:stop", ({ newIndex, oldIndex, dragEvent }) => {
  if (draggedOut) {
    dragEvent.data.originalSource.className = "empty";
    sources[oldIndex] = undefined;
    updateTotalSampleLength();
  } else sourceOrder.splice(newIndex, 0, sourceOrder.splice(oldIndex, 1)[0]);
});

const audioContext = new window.AudioContext();
const sources = Array.from({ length: 16 });
const sourceOrder = Array.from({ length: 16 }, (_, i) => i);

const initAudio = (data, i) => {
  const source = audioContext.createBufferSource();
  const pad = pads[i];
  const oldSource = sources[i];
  if (oldSource) {
    oldSource.stop(0);
    oldSource.disconnect(0);
  }

  audioContext.decodeAudioData(
    data,
    buffer => {
      source.buffer = buffer;
      pad.className = "playing";
      sources[i] = source;
      updateTotalSampleLength();
      playSource(source).then(() => {
        pad.className = "loaded";
        playButtonWrapper.className = pads.every(
          pad => pad.className === "loaded"
        )
          ? "loaded"
          : "";
      });
    },
    e => {
      console.error(e);
      pad.className = "failed";
      playButtonWrapper.className = "";
    }
  );
};

const playSource = source => {
  return new Promise((resolve, reject) => {
    source.playbackRate.value = settings.speed;
    source.connect(audioContext.destination);
    let ended = false;
    const end = () => {
      if (!ended) {
        ended = true;
        source.stop(0);
        source.disconnect(0);
        resolve();
      }
    };
    source.onended = e => {
      setTimeout(end, settings.gapMs);
    };
    source.start(0);
    setTimeout(end, settings.maxMs);
  });
};

// AudioBufferSourceNodes can only play once: https://developer.mozilla.org/en-US/docs/Web/API/AudioBufferSourceNode/start
const refreshSource = i => {
  const source = sources[i];
  try {
    source.stop(0);
  } finally {
    const newSource = audioContext.createBufferSource();
    newSource.buffer = source.buffer;
    return (sources[i] = newSource);
  }
};

const play = i => {
  if (sources[i]) {
    pads[i].className = "playing";
    const source = refreshSource(i);
    return playSource(source).then(() => (pads[i].className = "loaded"));
  }
};

const processFiles = (files, i) => {
  (function processFile(n) {
    const reader = new FileReader();
    reader.onload = e => {
      initAudio(e.target.result, i + n);
      if (++n < files.length && i + n < sources.length) processFile(n);
    };
    reader.readAsArrayBuffer(files[n]);
  })(0);
};

const dropEvent = i => e => {
  e.stopPropagation();
  e.preventDefault();
  processFiles(e.dataTransfer.files, i);
};

const blockEvent = e => {
  e.stopPropagation();
  e.preventDefault();
  return false;
};

pads.forEach((pad, i) => {
  pad.addEventListener("drop", dropEvent(i), false);
  pad.addEventListener("dragover", blockEvent, false);
  pad.querySelector("button").addEventListener(
    "click",
    () => {
      sources[i] ? play(i) : pad.querySelector("input").click();
    },
    false
  );
});
document.body.addEventListener("drop", blockEvent, false);
document.body.addEventListener("dragover", blockEvent, false);

const playAll = e => {
  const { className } = playButtonWrapper;
  playButtonWrapper.className = "playing";
  const playNext = i => {
    const playing = play(sourceOrder[i]);
    if (i >= sources.length) return (playButtonWrapper.className = className);
    else if (playing) {
      playing.then(() => playNext(i + 1));
    } else {
      playNext(i + 1);
    }
  };
  playNext(0);
};

updateUI();
playButton.append(document.createTextNode("Play all"));
playButton.addEventListener("click", playAll, false);
playButtonWrapper.append(playButton, infoBox);
sampler.append(container, playButtonWrapper);

let openPane = "sampler";
const toggles = Array.from(document.querySelectorAll(".toggle"));
const panes = Array.from(document.querySelectorAll(".pane"));
const namedPanes = panes.reduce((acc, pane) => {
  acc[pane.className.match(/([^- ]+)-pane/)[1]] = pane;
  return acc;
}, {});
toggles.forEach(toggle => {
  const targetPane = toggle.className.match(/([^- ]+)-toggle/)[1];
  toggle.addEventListener("click", () => {
    if (openPane === targetPane) {
      openPane = "sampler";
      toggle.classList.remove("open");
      namedPanes[targetPane].classList.remove("open-pane");
      namedPanes.sampler.classList.add("open-pane");
    } else {
      toggles.forEach(t => t.classList.remove("open"));
      panes.forEach(p => p.classList.remove("open-pane"));
      toggle.classList.add("open");
      namedPanes[targetPane].classList.add("open-pane");
      openPane = targetPane;
    }
  });
});

const keyMap = [
  "Digit1",
  "Digit2",
  "Digit3",
  "Digit4",
  "KeyQ",
  "KeyW",
  "KeyE",
  "KeyR",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyF",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyV"
];
document.addEventListener(
  "keydown",
  e => {
    if (e.repeat || openPane !== "sampler") return;
    const i = keyMap.indexOf(e.code);
    if (i >= 0) play(sourceOrder[i]);
  },
  false
);
