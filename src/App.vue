<template>
  <div v-bind:style="{ backgroundColor: color }" id="app">
    <div id="ava">
      <div class="mask">
        <!-- <div v-bind:style="{ borderColor: color }" class="left"></div>
        <div v-bind:style="{ borderColor: color }" class="right"></div> -->
        <img :src="ava.img" alt="ava" />
        <svg
          :width="ava.svg.width"
          :height="ava.svg.height"
          :viewBox="ava.svg.viewBox"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            :d="ava.svg.d"
            :fill="color"
          />
        </svg>
        <!-- <svg
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
        </svg> -->
      </div>
    </div>
    <select name="avas" id="avas" v-model="ava">
      <option v-for="a in avas" :key="a.id" :value="a">{{ a.name }}</option>
    </select>
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
      avas: [
        {
          name: "Lil Oddy",
          img: require("./assets/daulet.jpg"),
          svg: {
            width: 300,
            height: 200,
            viewBox: "0 0 299 104",
            d: "M0 25.624C22.7427 6.28752 81.0711 -20.7835 132.443 25.624C141.473 31.2916 163.346 39.2262 178.597 25.624C197.661 8.62124 275.923 -8.38152 299 37.6259V84.6335C283.281 96.9689 238.598 116.039 185.621 93.635C175.253 87.3006 150.102 78.4325 132.443 93.635C110.369 112.638 11.0369 98.6358 0 84.6335V25.624ZM27 50C54.5 38.8333 112.4 27 124 69C103.167 81.8333 54.6 96 27 50ZM191.5 71C202.5 52.8333 236.2 26.7 283 67.5C270.5 84.3333 234.7 108.6 191.5 71Z",
          },
        },
        {
          name: "ErkebulIcem4n",
          img: require("./assets/erke.png"),
          svg: {
            width: 275,
            height: 265,
            viewBox: "0 0 265 78",
            d: "M38.1356 29.008C53.3073 14.0833 93.6424 -8.54944 133.609 20.3178C140.477 23.6624 156.746 27.7392 166.88 17.2894C179.547 4.22723 234.888 -12.7192 254.433 17.7267L254.433 17.7278C256.825 16.1909 261.749 12.5069 262.5 7.99999L265 42C264.836 43.9652 261.326 48.9233 256.27 51.3722C244.756 61.0393 214.516 75.7542 176.243 64.074C168.369 60.3539 149.678 55.8438 137.909 67.5632C123.252 82.159 51.2367 79.0263 41.9662 70.0987L42 70.5C14 58.1 2.33333 44.6667 0 39.5V21.5C7.50654 29.7967 28.3132 29.9963 38.1382 29.0364L38.1356 29.008ZM59.1402 44.1698C78.2579 34.6082 119.248 22.5888 130.265 51.0039C116.059 61.2859 81.9447 74.3138 59.1402 44.1698ZM179.05 47.9643C185.831 34.6227 208.472 14.2573 244.788 39.5292C236.841 52.043 212.569 71.2494 179.05 47.9643Z",
          },
        },
      ],
      ava: {
        name: "Lil Oddy",
        img: require("./assets/daulet.jpg"),
        svg: {
          width: 300,
          height: 200,
          viewBox: "0 0 299 104",
          d: "M0 25.624C22.7427 6.28752 81.0711 -20.7835 132.443 25.624C141.473 31.2916 163.346 39.2262 178.597 25.624C197.661 8.62124 275.923 -8.38152 299 37.6259V84.6335C283.281 96.9689 238.598 116.039 185.621 93.635C175.253 87.3006 150.102 78.4325 132.443 93.635C110.369 112.638 11.0369 98.6358 0 84.6335V25.624ZM27 50C54.5 38.8333 112.4 27 124 69C103.167 81.8333 54.6 96 27 50ZM191.5 71C202.5 52.8333 236.2 26.7 283 67.5C270.5 84.3333 234.7 108.6 191.5 71Z",
        },
      },
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
  /* background: url("./assets/daulet.jpg"); */
}
#ava .mask img {
  position: absolute;
}
#ava .mask svg {
  position: absolute;
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
button {
  width: 100px;
  height: 40px;
  font-size: 18px;
}
</style>
