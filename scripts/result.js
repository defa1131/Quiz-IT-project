(function () {
    const Result = {
        init() {
            const url = new URL(location.href);
            const testId = url.searchParams.get('testId') || localStorage.getItem('testId');
            const chosenAnswers = url.searchParams.get('chosen_answers') || localStorage.getItem('chosen_answers');
            const score = url.searchParams.get('score') || localStorage.getItem('score');
            const total = url.searchParams.get('total') || localStorage.getItem('total');
            const rightAnswers = JSON.parse(localStorage.getItem('rightAnswers')) || [];

            document.getElementById('result-score').innerText = score + '/' + total;

            const viewAnswersLink = document.getElementById('pass');
            viewAnswersLink.addEventListener('click', (event) => {
                event.preventDefault();
                localStorage.setItem('testId', testId);
                localStorage.setItem('chosen_answers', chosenAnswers);
                localStorage.setItem('score', score);
                localStorage.setItem('total', total);

                const targetUrl = 'correct_answers.html?testId=' + testId + '&chosen_answers=' + chosenAnswers + '&score=' + score + '&total=' + total;
                window.location.href = targetUrl;
            });
            // Сохраняем правильные ответы в локальное хранилище, если они не сохранены
            if (rightAnswers.length === 0) {
                this.fetchRightAnswers(testId);
            }
        },
        fetchRightAnswers(testId) {
            const xhrRightAnswers = new XMLHttpRequest();
            xhrRightAnswers.open('GET', 'https://testologia.ru/get-quiz-right?id=' + testId, true);
            xhrRightAnswers.onload = () => {
                if (xhrRightAnswers.status === 200 && xhrRightAnswers.responseText) {
                    try {
                        const rightAnswers = JSON.parse(xhrRightAnswers.responseText);
                        localStorage.setItem('rightAnswers', JSON.stringify(rightAnswers));
                    } catch (error) {
                        console.error('Failed to parse right answers data:', error);
                    }
                } else {
                    console.error('Failed to fetch right answers');
                }
            };
            xhrRightAnswers.send();
        }
    }
    Result.init();
})();