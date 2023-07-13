<template>
  <div class='monaco-loading'>
    <div class='circle'></div>
    <div class='circle'></div>
    <div class='circle'></div>
    <div class='circle'></div>
    <div class='circle'></div>
  </div>
</template>

<style>
.monaco-loading {
  width: 50px;
  height: 50px;
  margin: auto;
}
.monaco-loading .circle {
  position: absolute;
  width: 38px;
  height: 38px;
  opacity: 0;
  transform: rotate(225deg);
  animation-iteration-count: infinite;
  animation-name: orbit;
  animation-duration: 5.5s;
}
.monaco-loading .circle:after {
  content: '';
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 6px;
  background: #a0a0a0;
  box-shadow: 0 0 0.5625em rgba(0, 0, 0, .1);
}
.monaco-loading .circle:nth-child(2) {
  animation-delay: 240ms;
}
.monaco-loading .circle:nth-child(3) {
  animation-delay: 480ms;
}
.monaco-loading .circle:nth-child(4) {
  animation-delay: 720ms;
}
.monaco-loading .circle:nth-child(5) {
  animation-delay: 960ms;
}
@keyframes orbit {
  0% {
    transform: rotate(225deg);
    opacity: 1;
    animation-timing-function: ease-out;
  }
  7% {
    transform: rotate(345deg);
    animation-timing-function: linear;
  }
  30% {
    transform: rotate(455deg);
    animation-timing-function: ease-in-out;
  }
  39% {
    transform: rotate(690deg);
    animation-timing-function: linear;
  }
  70% {
    transform: rotate(815deg);
    opacity: 1;
    animation-timing-function: ease-out;
  }
  75% {
    transform: rotate(945deg);
    animation-timing-function: ease-out;
  }
  76% {
    transform: rotate(945deg);
    opacity: 0;
  }
  100% {
    transform: rotate(945deg);
    opacity: 0;
  }
}

.dark .monaco-loading .circle:after {
  box-shadow: 0 0 9px rgba(255, 255, 255, .7);
}
</style>
