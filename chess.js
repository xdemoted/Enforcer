let prompt = "This is a <u>test</u> string with some <u>underlined</u> words.";
let regex = /(?<=<u>).*?(?=<\/u>)/g;
let answers = prompt.match(regex);
let answer = "underlined"
function checkAnswer(answer) {
    if (answers.includes(answer)) {
        return "true"
    } else {
        if (answer.length > 2) {
            for (let i = 0; i < answers.length; i++) {
                if (answers[i].includes(answer)) {
                    return "prompt"
                }
            }
        }
        return "false"
    }
}
console.log(answers)
console.log(checkAnswer(answer))