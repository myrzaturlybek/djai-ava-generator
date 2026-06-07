<template>
  <div id="app" class="app">
    <div class="container">
      <div class="preview">
        <div id="ava" :class="selectedFilter.class">
          <div class="mask">
            <img :src="ava.img" alt="ava" />
            <svg
              :width="ava.svg.width"
              :height="ava.svg.height"
              :viewBox="ava.svg.viewBox"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                v-for="part in ava.svg.parts"
                :key="part.id"
                fill-rule="evenodd"
                clip-rule="evenodd"
                :d="part.d"
                :fill="part.colorable ? partColors[part.id] : part.fill"
              />
            </svg>
          </div>
        </div>
      </div>

      <div class="controls">
        <h1 class="title">Avatar Generator</h1>

        <div class="control-group">
          <label for="avatars">Выбор аватара:</label>
          <select id="avatars" v-model="ava" class="select">
            <option v-for="a in avas" :key="a.name" :value="a">{{ a.name }}</option>
          </select>
        </div>

        <div class="control-group">
          <label for="filter">Фильтр:</label>
          <select id="filter" v-model="selectedFilterId" class="select">
            <option v-for="f in filters" :key="f.id" :value="f.id">{{ f.label }}</option>
          </select>
        </div>

        <div class="color-controls">
          <div v-for="part in colorableParts" :key="part.id" class="control-group">
            <label :for="'color-' + part.id">{{ part.label }}:</label>
            <div class="color-input-wrapper">
              <input
                :id="'color-' + part.id"
                v-model="partColors[part.id]"
                type="color"
                class="color-input"
              />
              <span class="color-value">{{ partColors[part.id] }}</span>
            </div>
          </div>
        </div>

        <button @click="printDiv()" class="btn-save">Скачать</button>
      </div>
    </div>
  </div>
</template>

<script>
import html2canvas from "html2canvas";

export default {
  name: "App",
  data() {
    return {
      avas: [
        {
          name: "Lil Oddy",
          img: require("./assets/daulet.jpg"),
          svg: {
            width: 300,
            height: 200,
            viewBox: "0 0 299 104",
            parts: [
              {
                id: "body",
                d: "M0 25.624C22.7427 6.28752 81.0711 -20.7835 132.443 25.624C141.473 31.2916 163.346 39.2262 178.597 25.624C197.661 8.62124 275.923 -8.38152 299 37.6259V84.6335C283.281 96.9689 238.598 116.039 185.621 93.635C175.253 87.3006 150.102 78.4325 132.443 93.635C110.369 112.638 11.0369 98.6358 0 84.6335V25.624Z",
                colorable: true,
                label: "Тело",
              },
              {
                id: "eyes-left",
                d: "M27 50C54.5 38.8333 112.4 27 124 69C103.167 81.8333 54.6 96 27 50Z",
                colorable: false,
                fill: "#FFFEFE",
                label: "Глаз левый",
              },
              {
                id: "eyes-right",
                d: "M191.5 71C202.5 52.8333 236.2 26.7 283 67.5C270.5 84.3333 234.7 108.6 191.5 71Z",
                colorable: false,
                fill: "#FFFEFE",
                label: "Глаз правый",
              },
            ],
          },
        },
        {
          name: "ErkebulIcem4n",
          img: require("./assets/erke.png"),
          svg: {
            width: 275,
            height: 265,
            viewBox: "0 0 265 78",
            parts: [
              {
                id: "body",
                d: "M38.1356 29.008C53.3073 14.0833 93.6424 -8.54944 133.609 20.3178C140.477 23.6624 156.746 27.7392 166.88 17.2894C179.547 4.22723 234.888 -12.7192 254.433 17.7267L254.433 17.7278C256.825 16.1909 261.749 12.5069 262.5 7.99999L265 42C264.836 43.9652 261.326 48.9233 256.27 51.3722C244.756 61.0393 214.516 75.7542 176.243 64.074C168.369 60.3539 149.678 55.8438 137.909 67.5632C123.252 82.159 51.2367 79.0263 41.9662 70.0987L42 70.5C14 58.1 2.33333 44.6667 0 39.5V21.5C7.50654 29.7967 28.3132 29.9963 38.1382 29.0364L38.1356 29.008Z",
                colorable: true,
                label: "Тело",
              },
              {
                id: "eyes-left",
                d: "M59.1402 44.1698C78.2579 34.6082 119.248 22.5888 130.265 51.0039C116.059 61.2859 81.9447 74.3138 59.1402 44.1698Z",
                colorable: false,
                fill: "#FFFEFE",
                label: "Глаз левый",
              },
              {
                id: "eyes-right",
                d: "M179.05 47.9643C185.831 34.6227 208.472 14.2573 244.788 39.5292C236.841 52.043 212.569 71.2494 179.05 47.9643Z",
                colorable: false,
                fill: "#FFFEFE",
                label: "Глаз правый",
              },
            ],
          },
        },
      ],
      filters: [
        { id: "none", label: "Без фильтра", class: "" },
        { id: "bw", label: "Черно-белый", class: "filter-bw" },
        { id: "sepia", label: "Сепия", class: "filter-sepia" },
        { id: "blur", label: "Размытие", class: "filter-blur" },
        { id: "brightness", label: "Яркость", class: "filter-bright" },
        { id: "saturate", label: "Насыщенность", class: "filter-saturate" },
      ],
      selectedFilterId: "none",
      partColors: {
        body: "#cc3838",
        "eyes-left": "#FFFEFE",
        "eyes-right": "#FFFEFE",
      },
    };
  },
  computed: {
    ava: {
      get() {
        return this._ava || this.avas[0];
      },
      set(value) {
        this._ava = value;
        this.initializePartColors();
      },
    },
    selectedFilter() {
      return this.filters.find((f) => f.id === this.selectedFilterId) || this.filters[0];
    },
    colorableParts() {
      return this.ava.svg.parts.filter((p) => p.colorable);
    },
  },
  mounted() {
    this._ava = this.avas[0];
    this.initializePartColors();
  },
  methods: {
    initializePartColors() {
      this.ava.svg.parts.forEach((part) => {
        if (part.colorable && !this.partColors[part.id]) {
          this.$set(this.partColors, part.id, "#cc3838");
        }
      });
    },
    printDiv() {
      function downloadURI(uri, name) {
        var link = document.createElement("a");
        link.download = name;
        link.href = uri;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      html2canvas(document.getElementById("ava")).then((canvas) => {
        var myImage = canvas.toDataURL();
        downloadURI(myImage, "djaiava.png");
      });
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:root {
  --primary: #6366f1;
  --primary-light: #818cf8;
  --secondary: #ec4899;
  --success: #10b981;
  --bg: #f8fafc;
  --bg-card: #ffffff;
  --text: #1e293b;
  --text-light: #64748b;
  --border: #e2e8f0;
  --shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.1);
  --transition: all 0.3s ease;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  background-color: var(--bg);
}

.app {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  max-width: 1200px;
  width: 100%;
  background: var(--bg-card);
  border-radius: 16px;
  padding: 40px;
  box-shadow: var(--shadow-lg);
}

.preview {
  display: flex;
  align-items: center;
  justify-content: center;
}

#ava {
  position: relative;
  width: 350px;
  height: 350px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(236, 72, 153, 0.1));
  transition: var(--transition);
}

#ava.filter-bw {
  filter: grayscale(100%);
}

#ava.filter-sepia {
  filter: sepia(100%);
}

#ava.filter-blur {
  filter: blur(3px);
}

#ava.filter-bright {
  filter: brightness(1.3);
}

#ava.filter-saturate {
  filter: saturate(1.8);
}

.mask {
  width: 100%;
  height: 100%;
  position: relative;
}

.mask img,
.mask svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.select,
.color-input {
  padding: 12px 16px;
  border: 2px solid var(--border);
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: #fff;
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
}

.select:hover,
.color-input:hover {
  border-color: var(--primary);
}

.select:focus,
.color-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.color-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 16px;
  border-top: 2px solid var(--border);
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 60px;
  height: 50px;
  padding: 4px;
  cursor: color-picker;
  border-radius: 8px;
  border: 2px solid var(--border);
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.color-value {
  font-weight: 500;
  font-family: "Monaco", "Courier New", monospace;
  color: var(--text-light);
  font-size: 12px;
  text-transform: uppercase;
}

.btn-save {
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--primary), var(--primary-light));
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: var(--shadow);
  margin-top: 16px;
}

.btn-save:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-save:active {
  transform: translateY(0);
}

/* Адаптивный дизайн для планшетов и мобильных */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
    gap: 30px;
    padding: 30px;
  }

  #ava {
    width: 300px;
    height: 300px;
  }

  .title {
    font-size: 24px;
  }
}

@media (max-width: 768px) {
  .app {
    padding: 16px;
  }

  .container {
    padding: 24px;
    gap: 24px;
  }

  #ava {
    width: 280px;
    height: 280px;
  }

  .controls {
    gap: 16px;
  }

  .title {
    font-size: 20px;
  }

  .select,
  .color-input {
    font-size: 16px;
    padding: 10px 14px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 16px;
    border-radius: 12px;
  }

  #ava {
    width: 240px;
    height: 240px;
  }

  .title {
    font-size: 18px;
  }

  .color-input-wrapper {
    flex-direction: column;
    align-items: flex-start;
  }

  .color-input {
    width: 100%;
  }

  label {
    font-size: 12px;
  }
}
</style>
