import { defineComponent, onMounted, ref, nextTick, watch } from "vue";
import Slider from "@vueform/slider";
import { fabric } from "fabric";
import { saveAs } from "file-saver";
import { Vue3Lottie } from "vue3-lottie";
import Spinner from "../spinner/spinner.vue";
import CgJSON from "../../assets/cong.json";
import axios from "axios";
const canvasWidth = 717;
const canvasHeight = 500;
// const grid = 100;
const cloudOptions = {
  width: canvasWidth, //int, width of the writing area, default: undefined
  height: canvasHeight, //int, height of the writing area, default: undefined
  language: "en", //string, language of input trace, default: "zh_TW"
  // numOfWords: 2, //int, number of words of input trace, default: undefined
  // numOfReturn: 2, //int, number of maximum returned results, default: undefined
};

export default defineComponent({
  components: { Spinner, Vue3Lottie, Slider },
  setup: () => {
    const drawing = ref(false);
    const targetLine = ref(0);
    const compileResult = ref("");
    const compileResultBy = ref("");
    const cRef = ref(null);
    const lottieRef = ref(null);
    const azureCompileLoading = ref(false);
    const cloudCompileLoading = ref(false);
    const requestController = ref(null);
    const paths = ref([]);
    const lineSize = ref(70);
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
        const pointer = canvas.getPointer(event);
        paths.value.push(pointer);
        const currentLine = event.target;
        if (!targetLine.value && currentLine) {
          targetLine.value = currentLine && currentLine.id;
        }
        if (targetLine.value) {
          if (
            !currentLine ||
            (currentLine.type === "rect" && currentLine.id !== targetLine.value)
          ) {
            canvas.getObjects().forEach((obj) => {
              if (obj.type === "rect" && obj.id === targetLine.value) {
                obj.set("stroke", "#FFB4B4");
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
      canvas.on("object:added", (event) => {
        //console.log("new object", event);
      });
    };

    const clearWhiteboard = () => {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "rect") {
          obj.set("stroke", "transparent");
          return;
        }
        canvas.remove(obj);
      });
      targetLine.value = 0;
      if (requestController.value) {
        requestController.value.abort();
        requestController.value = null;
      }
      if (paths.value.length) {
        paths.value = [];
      }
      canvas.renderAll();
    };

    const compileWhiteboardWithAzure = () => {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "rect") {
          obj.set("stroke", "transparent");
        }
      });
      cRef.value.toBlob(function (blob) {
        // saveAs(blob, "myIMG.png");
        const bodyFormData = new FormData();
        bodyFormData.append("image", blob);
        azureCompileLoading.value = true;
        requestController.value = new AbortController();
        axios({
          method: "post",
          url: "https://localhost:7126/Home/HandwrittenCanvas",
          data: bodyFormData,
          headers: { "Content-Type": "multipart/form-data" },
          signal: requestController.value.signal,
        })
          .then(function (response) {
            //handle success
            azureCompileLoading.value = false;
            compileResultBy.value = "Microsoft Azure";
            if (response.data.data.length) {
              compileResult.value = response.data.data.join(", ");
              displayFire();
            } else {
              compileResult.value = "No matching results 📔  ";
            }
          })
          .catch(function (response) {
            //handle error
            azureCompileLoading.value = false;
          });
      });
    };

    const compileWhiteboardWithCloud = () => {
      cloudCompileLoading.value = true;
      const listOfX = [];
      const listOfY = [];
      paths.value.forEach((point) => {
        listOfX.push(point.x);
        listOfY.push(point.y);
      });
      const trace = [[listOfX, listOfY]];
      const callback = function (result, err) {
        cloudCompileLoading.value = false;
        if (err) {
          throw err;
        } else {
          compileResultBy.value = "Google Cloud";
          if (result.length) {
            compileResult.value = result.join(", ");
            displayFire();
          } else {
            compileResult.value = "No matching results 📔  ";
          }
        }
      };
      handwriting.recognize(trace, cloudOptions, callback);
    };

    const displayFire = async () => {
      lottieRef.value.play();
      setTimeout(() => {
        lottieRef.value.stop();
      }, 3000);
    };

    const drawTheGrid = () => {
      canvas.getObjects().forEach((obj) => {
        if (obj.type === "rect") {
          canvas.remove(obj);
        }
      });
      for (var i = 0; i < canvasWidth / lineSize.value; i++) {
        const line = new fabric.Rect({
          left: 0,
          top: lineSize.value * i,
          height: lineSize.value - 5,
          width: 717 - 10,
          stroke: "transparent",
          fill: "#fff",
          strokeWidth: 10,
        });
        line.set("id", i + 1);
        canvas.add(line);
      }
      canvas.renderAll();
    };

    watch(lineSize, (currentVal) => {
      clearWhiteboard();
      drawTheGrid();
    });

    onMounted(async () => {
      initCanvas();
    });

    return {
      clearWhiteboard,
      compileWhiteboardWithAzure,
      cRef,
      compileResult,
      azureCompileLoading,
      CgJSON,
      lottieRef,
      compileWhiteboardWithCloud,
      cloudCompileLoading,
      compileResultBy,
      lineSize,
    };
  },
});
