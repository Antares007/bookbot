// flow strict
const document = require("../src/document");
var state = {};
const b = document.bark((r) => {
  state = r(state);
});
function nar(o: document.pith_t<{}>) {
  const pw = 16;
  const ph = 16;
  o.head((o) =>
    o.element("style", (o) =>
      o.text(`
        .pixel {
          position: absolute;
          width: ${pw}px;
          height: ${ph}px;
        }
        body {
          border: 0;
          padding: 0;
          margin: 0;
        }
        .background {
          background: black;
          width: 100vw;
          height: 100vh;
        }`)
    )
  );
  o.element("div.background", (o) => {
    o.on("create", (elm) => {
      const w = (elm.clientWidth / pw) | 0;
      const h = (elm.clientHeight / ph) | 0;
      o.head((o) => {
        o.element("style", (o) => {}, "abo");
        o.element(
          "link",
          (o) => {
            //o.attr(
            //  "href",
            //  "https://stackpath.bootstrapcdn.com/bootstrap/5.0.0-alpha1/css/bootstrap.min.css"
            //);
          },
          "bootstrap5"
        );
      });
      for (var i = 0; i < w * h; i++)
        o.element("div.pixel", (o) => {
          //o.style(
          //  "background-color",
          //  `rgb(${i % 256}, ${((256 / 16) * (i % 16)) | 0}, ${
          //    ((256 / 8) * (i % 8)) | 0
          //  })`
          //);
          //o.style("top", ((i / w) | 0) * ph + "px");
          //o.style("left", (i % w) * pw + "px");
        });
    });
  });
}
b(nar);
Object.assign(window, { b, nar });
