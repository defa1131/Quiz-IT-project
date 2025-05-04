(function () {
    const AnswersPage = {
        quiz: null,
        rightAnswers: [],
        chosenAnswers: null,

        init() {
            const testId = this.getTestId();
            const chosenAnswersParam = this.getChosenAnswersParam();

            if (testId && chosenAnswersParam) {
                // Отправляем запрос для получения данных о тесте
                this.fetchQuizData(testId);
                this.chosenAnswers = this.splitAnswers(chosenAnswersParam);

                // Получаем правильные ответы из localStorage
                const storedRightAnswers = localStorage.getItem('rightAnswers');
                if (storedRightAnswers) {
                    this.rightAnswers = JSON.parse(storedRightAnswers);
                    this.findElements();
                } else {
                    // Если правильные ответы не сохранены, отправляем запрос для их получения
                    this.fetchRightAnswers(testId);
                }
            } else {
                console.error('Test ID или выбранные ответы не найдены');
            }

            this.setupEventListeners();
        },

        getTestId() {
            return new URL(location.href).searchParams.get('testId') || localStorage.getItem('testId');
        },

        getChosenAnswersParam() {
            return new URL(location.href).searchParams.get('chosen_answers') || localStorage.getItem('chosen_answers');
        },

        splitAnswers(param) {
            return param.split(',').filter(Boolean);
        },

        fetchQuizData(testId) {
            const xhrQuiz = new XMLHttpRequest();
            xhrQuiz.open('GET', 'https://testologia.ru/get-quiz?id=' + testId, true);
            xhrQuiz.onload = () => {
                if (xhrQuiz.status === 200 && xhrQuiz.responseText) {
                    try {
                        this.quiz = JSON.parse(xhrQuiz.responseText);
                        this.findElements();
                    } catch (error) {
                        console.error('Failed to parse quiz data:', error);
                    }
                } else {
                    console.error('Failed to fetch quiz');
                }
            };
            xhrQuiz.send();
        },

        fetchRightAnswers(testId) {
            const xhrRightAnswers = new XMLHttpRequest();
            xhrRightAnswers.open('GET', 'https://testologia.ru/get-quiz-right?id=' + testId, true);
            xhrRightAnswers.onload = () => {
                if (xhrRightAnswers.status === 200 && xhrRightAnswers.responseText) {
                    try {
                        this.rightAnswers = JSON.parse(xhrRightAnswers.responseText);
                        localStorage.setItem('rightAnswers', JSON.stringify(this.rightAnswers));
                        this.findElements();
                    } catch (error) {
                        console.error('Failed to parse right answers data:', error);
                    }
                } else {
                    console.error('Failed to fetch right answers');
                }
            };
            xhrRightAnswers.send();
        },

        findElements() {
            if (this.quiz && this.rightAnswers.length > 0) {
                this.questionsContainerElement = document.getElementById('questions-container');
                this.showQuestions();
            }
        },

        showQuestions() {
            this.questionsContainerElement.innerHTML = '';

            this.quiz.questions.forEach((question, index) => {
                const questionElement = document.createElement('div');
                questionElement.className = 'test-answer';

                const questionTitleElement = document.createElement('div');
                questionTitleElement.className = 'test-answer-title test-title';
                questionTitleElement.innerHTML = '<span>Вопрос ' + (index + 1) + ':</span> ' + question.question;
                questionElement.appendChild(questionTitleElement);

                const questionOptionsElement = document.createElement('div');
                questionOptionsElement.className = 'test-answer-options';

                question.answers.forEach(answer => {
                    const answerOptionElement = document.createElement('div');
                    answerOptionElement.className = 'test-answer-option';

                    const inputElement = document.createElement('input');
                    inputElement.setAttribute('type', 'radio');
                    inputElement.setAttribute('name', 'question-' + question.id);
                    inputElement.setAttribute('value', answer.id);
                    inputElement.disabled = true;

                    if (this.chosenAnswers.includes(answer.id.toString())) {
                        inputElement.checked = true;
                        if (this.rightAnswers.includes(answer.id)) {
                            answerOptionElement.classList.add('correct');
                        } else {
                            answerOptionElement.classList.add('incorrect');
                        }
                    }

                    const labelElement = document.createElement('label');
                    labelElement.innerText = answer.answer;

                    answerOptionElement.appendChild(inputElement);
                    answerOptionElement.appendChild(labelElement);
                    questionOptionsElement.appendChild(answerOptionElement);
                });

                questionElement.appendChild(questionOptionsElement);
                this.questionsContainerElement.appendChild(questionElement);
            });
        },

        setupEventListeners() {
            const resultLink = document.getElementById('result-link');
            const passLink = document.getElementById('pass');

            resultLink.addEventListener('click', this.handleNavBack.bind(this));
            passLink.addEventListener('click', this.handleNavBack.bind(this));
        },

        handleNavBack(event) {
            event.preventDefault();
            window.location.href = 'result.html';
        },
    };

    AnswersPage.init();
})();
