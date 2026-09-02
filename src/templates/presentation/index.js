import Reveal from "reveal.js";
import RevealHighlight from "reveal.js/plugin/highlight";

let deck = new Reveal({
  controls: false,
  progress: false,
  slideNumber: false,
  hash: true,
  history: true,
  disableLayout: true,
  display: "flex",
  transition: "none",
  plugins: [RevealHighlight],
});

deck.initialize();
