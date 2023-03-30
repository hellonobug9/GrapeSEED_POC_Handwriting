<template>
  <div class="writer-page">
    <div class="actions">
        <button class="clear-btn" role="button" @click="clearWhiteboard">Clear board</button>
    </div>
    <canvas id="mainCanvas" />
  </div>
</template>
<script src="./writer.js"></script>
<style lang="scss" scoped src="./writer.css"></style>
