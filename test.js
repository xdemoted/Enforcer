const { default: axios } = require("axios");
async function run() {
    console.log((await axios.get("https://random-word-api.herokuapp.com/word")).data[0])

}
run()