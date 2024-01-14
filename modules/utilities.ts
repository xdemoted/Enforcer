export function getRandomObject<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
export function getRandomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function isSqrt(value: number) {
    return ((value ** 0.5) == Math.floor(value ** 0.5) ? true : false)
}
export function multiples(num: number) {
    let multiples: any[] = []
    for (let i = 0; i < num; i++) {
        const result = num / i
        if ((result - Math.floor(result) == 0)) {
            multiples.push(result)
        }
    }
    return multiples
}
export function random(min: number, max: number) {
    return Math.round(Math.random() * (max - min)) + min
}
export interface triviaData {
    data: {
        category: string
        id: string
        correctAnswer: string
        incorrectAnswers: string[]
        question: string
        tags: string[]
        type: string
        difficulty: string
    }[]
}
export function stringMax(str: string, max: number) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str
}
