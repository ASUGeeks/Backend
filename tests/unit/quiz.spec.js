const { Quiz } = require("../../src/resources/quizes/quiz.model");
const mongoose = require("mongoose");

describe("test quiz grading", () => {
    it("should return an array of two elements with grade and length of quiz", () =>{
        const course_id = new mongoose.Types.ObjectId();
        const quiz = new Quiz({
            course: course_id,
            content: [
                {hash: "adlfkjad", question: "1", valid_answers: ["1", "2", "3", "4"]},
                {hash: "adlfkj", question: "2", valid_answers: ["1", "2", "3", "4"]},
                {hash: "adlfad", question: "3", valid_answers: ["1", "2", "3", "4"]},
                {hash: "adffkjad", question: "4", valid_answers: ["1", "2", "3", "4"]},
                {hash: "adlfkad", question: "5", valid_answers: ["1", "2", "3", "4"]}
            ],
            correct_answers: [
                {hash: "adlfkjad", answer: "1"},
                {hash: "adlfkj", answer: "2"},
                {hash: "adlfad", answer: "3"},
                {hash: "adffkjad", answer: "4"},
                {hash: "adlfkad", answer: "5"}
            ],
            title: "Quiz 1",
            start_date: new Date()
        });

        const grades = quiz.grade([
            {hash: "adlfkjad", answer: "1"},
            {hash: "adlfkj", answer: "2"},
            {hash: "adlfad", answer: "3"},
            {hash: "adffkjad", answer: "2"},
            {hash: "adlfkad", answer: "2"}
        ]);

        expect(grades[0]).toBe(3);
        expect(grades[1]).toBe(5);
    })
});
