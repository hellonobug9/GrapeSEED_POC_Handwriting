import { defineComponent, onMounted, ref, nextTick } from "vue";
import { fabric } from "fabric";
const canvasWidth = 717;
const canvasHeight = 500;
const grid = 100;
export default defineComponent({
  setup: () => {
    const drawing = ref(false);
    const targetLine = ref(0);
    let canvas;
    const initCanvas = () => {
      canvas = new fabric.Canvas("mainCanvas", { isDrawingMode: true });
      fabric.Object.prototype.transparentCorners = false;
      canvas.perPixelTargetFind = true;
      canvas.targetFindTolerance = true;
      canvas.setWidth(canvasWidth);
      canvas.setHeight(canvasHeight);
      registerEvent();
      drawTheGrid();
    };

    // utils
    const registerEvent = () => {
      canvas.on("mouse:move", (event) => {
        if (!drawing.value) return;
        const currentLine = event.target;
        if (!targetLine.value && currentLine) {
          targetLine.value = currentLine && currentLine.id;
        }
        if (targetLine.value) {
          if (
            !currentLine ||
            (currentLine.type == "line" && currentLine.id !== targetLine.value)
          ) {
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "line" && obj.id === targetLine.value) {
                obj.set("stroke", "#E21818");
                canvas.renderAll();
              }
            });
          }
        }
      });
      canvas.on("mouse:down", (event) => {
        drawing.value = true;
        canvas.renderAll();
      });
      canvas.on("mouse:up", (event) => {
        drawing.value = false;
        canvas.renderAll();
      });
      // canvas.on("mouseover", function (e) {
      //   console.log('OVER', e.target.id);
      //   // e.target.set('stroke', 'red');
      //   if (drawing.value && !targetLine.value) {
      //     targetLine.value = e.target.id;
      //     canvas.renderAll();
      //   }

      // });

      // canvas.on("mouseout", function (e) {
      //   console.log("OUT", e.target.id);
      //   if (
      //     drawing.value &&
      //     targetLine.value &&
      //     targetLine.value === e.target.id
      //   ) {
      //     e.target.set("stroke", "red");
      //     canvas.renderAll();
      //   }
      // });
    };

    const clearWhiteboard = () => {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "line") {
          obj.set("stroke", "#ffff");
          return;
        }
        canvas.remove(obj);
      });
      targetLine.value = 0;
      canvas.renderAll();
    };

    const drawTheGrid = () => {
      for (var i = 0; i < canvasWidth / grid; i++) {
        const line = new fabric.Line([0, i * grid, canvasWidth, i * grid], {
          type: "line",
          stroke: "#ffff",
          selectable: false,
          strokeWidth: grid - 5,
          perPixelTargetFind: true,
        });
        line.set("id", i + 1);
        canvas.add(line);
      }
    };

    onMounted(async () => {
      initCanvas();
    });

    return { clearWhiteboard };
  },
});
