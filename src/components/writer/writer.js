import { defineComponent, onMounted, ref, nextTick } from "vue";
import { fabric } from "fabric";
import { Vue3Lottie } from "vue3-lottie";
import Spinner from "../spinner/spinner.vue";
import CgJSON from "../../assets/cong.json";
import axios from "axios";
const canvasWidth = 717;
const canvasHeight = 500;
const grid = 100;
export default defineComponent({
  components: { Spinner, Vue3Lottie },
  setup: () => {
    const drawing = ref(false);
    const targetLine = ref(0);
    const compileResult = ref("");
    const cRef = ref(null);
    const lottieRef = ref(null);
    const compileLoading = ref(false);
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

    const compileWhiteboard = () => {
      cRef.value.toBlob(function (blob) {
        // saveAs(blob, "myIMG.png");
        const bodyFormData = new FormData();
        bodyFormData.append("image", blob);
        compileLoading.value = true;
        axios({
          method: "post",
          url: "https://localhost:7126/Home/HandwrittenCanvas",
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
        })
          .then(function (response) {
            //handle success
            console.log(response);
            console.log("response.data.data", response.data.data);
            compileLoading.value = false;
            if (response.data.data.length) {
              compileResult.value = response.data.data.join(", ");
              displayFire();
            } else {

              compileResult.value = "No matching results 📓  ";
            }
          })
          .catch(function (response) {
            //handle error
            console.log(response);
            compileLoading.value = false;
          });
      });
    };

    const displayFire = () => {
      lottieRef.value.play();
      setTimeout(() => {
        lottieRef.value.stop();
      }, 3000);
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

    return {
      clearWhiteboard,
      compileWhiteboard,
      cRef,
      compileResult,
      compileLoading,
      CgJSON,
      lottieRef,
    };
  },
});
