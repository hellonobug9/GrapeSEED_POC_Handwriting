<template>
  <div class="writer-page">
    <div class="actions">
      <button
        class="btn"
        role="button"
        :disabled="compileLoading"
        @click="compileWhiteboard"
      >
        <div :class="[compileLoading && 'hidden']">Compile</div>
        <Spinner
          v-show="compileLoading"
          style="width: 1.5rem; height: 1.5rem"
        />
      </button>
      <button class="btn compile" role="button" @click="clearWhiteboard">
        Clear board
      </button>
    </div>
    <div class="canvas-wrapper">
      <canvas ref="cRef" id="mainCanvas" />
      <Vue3Lottie
        class="fire"
        ref="lottieRef"
        :animationData="CgJSON"
        :height="400"
        :width="400"
        v-on:animCreated="handleAnimation"
        :autoPlay="false"
        :loop="false"
      />
    </div>
    <div class="result">
      <span class="title">Result:</span> {{ compileResult }}
    </div>
  </div>
</template>
<script src="./writer.js"></script>
<style scoped src="./writer.css"></style>
