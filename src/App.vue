<template>
  <div v-bind:style="{ backgroundColor: color }" id="app">
    <div id="ava">
      <div class="mask">
        <!-- <div v-bind:style="{ borderColor: color }" class="left"></div>
        <div v-bind:style="{ borderColor: color }" class="right"></div> -->
        <svg
          width="300"
          height="200"
          viewBox="0 0 299 104"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M132.443 25.624C81.0711 -20.7835 22.7427 6.28752 0 25.624V84.6335C11.0369 98.6358 110.369 112.638 132.443 93.635C150.102 78.4325 175.253 87.3006 185.621 93.635C238.598 116.039 283.281 96.9689 299 84.6335V37.6259C275.923 -8.38151 197.661 8.62124 178.597 25.624C163.346 39.2262 141.473 31.2916 132.443 25.624Z"
            :fill="color"
          />
          <path
            d="M27 50C54.5 38.8333 112.4 27 124 69C103.167 81.8333 54.6 96 27 50Z"
            fill="#FFFEFE"
          />
          <path
            d="M191.5 71C202.5 52.8333 236.2 26.7 283 67.5C270.5 84.3333 234.7 108.6 191.5 71Z"
            fill="#FFFEFE"
          />
        </svg>
      </div>
    </div>
    <input type="color" name="color" id="color" v-model="color" />
    <button @click="printDiv()">save</button>
  </div>
</template>

<script>
import html2canvas from "html2canvas";

export default {
  name: "App",
  data() {
    return {
      color: "#cc3838",
    };
  },
  methods: {
    printDiv() {
      function downloadURI(uri, name) {
        var link = document.createElement("a");

        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
      }
      html2canvas(document.getElementById("ava")).then((canvas) => {
        var myImage = canvas.toDataURL();
        downloadURI(myImage, "djaiava.png");
      });
    },
  },
};
</script>

<style>
body {
  margin: 0;
}
#ava {
  width: 300px;
  height: 300px;
  background: url("./assets/daulet.jpg");
}
#app {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.mask {
  width: 100%;
  position: relative;
}
.left {
  position: absolute;
  top: 58px;
  width: 87px;
  height: 26px;
  border: solid 37px red;
  border-radius: 57px;
}
.right {
  position: absolute;
  top: 66px;
  right: 0;
  width: 87px;
  height: 26px;
  border: solid 37px red;
  border-radius: 57px;
}
button {
  width: 100px;
  height: 40px;
  font-size: 18px;
}
</style>
