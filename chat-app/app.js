const API_KEY = "AIzaSyA3jLJjBvwVZXPfHJo7BIV2RXYFpfCkH48"; // Replace with your actual API key

const app = new Vue({
  el: "#application",
  data: {
    textToTranslate: "",
    targetLanguage: "es",
    translatedText: "",
  },
  methods: {
    async translate() {
      if (!this.textToTranslate) {
        alert("Please enter text to translate.");
        return;
      }

      try {
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`,
          {
            q: this.textToTranslate,
            target: this.targetLanguage,
          }
        );

        if (
          response.data &&
          response.data.data &&
          response.data.data.translations &&
          response.data.data.translations.length > 0
        ) {
          this.translatedText =
            response.data.data.translations[0].translatedText;
        } else {
          alert("Translation failed. Please try again.");
        }
      } catch (error) {
        console.error("Error while translating:", error);
        alert("Translation failed. Please try again.");
      }
    },
  },
});
