<template>
  <div class="writer-page">
    <div class="actions">
      <button
        class="btn"
        role="button"
        :disabled="azureCompileLoading"
        @click="compileWhiteboardWithAzure"
      >
        <div :class="['btn-title', azureCompileLoading && 'hidden']">
          <div>Detect by Azure</div>
          <div class="image"><img src="../../assets/azure-icon.png" /></div>
        </div>
        <Spinner
          v-show="azureCompileLoading"
          style="width: 1.5rem; height: 1.5rem"
        />
      </button>
      <button
        class="btn"
        role="button"
        :disabled="cloudCompileLoading"
        @click="compileWhiteboardWithCloud"
      >
        <div :class="['btn-title', cloudCompileLoading && 'hidden']">
          <div>Detect by Cloud</div>
          <div class="image"><img src="../../assets/cloud-icon.png" /></div>
        </div>
        <Spinner
          v-show="cloudCompileLoading"
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
      <p><span class="title">Result:</span> {{ compileResult }}</p>
      <p class="by" v-if="compileResultBy">Powered by {{compileResultBy}}</p>
    </div>
  </div>
</template>
<script src="./writer.js"></script>
<style scoped src="./writer.css"></style>
