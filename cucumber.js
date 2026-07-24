export default {
    paths: ['features/**/*.feature'],
    import: ['step-definitions/**/*.js', 'support/**/*.js'],
    format: [
        'progress-bar',
        'allure-cucumberjs/reporter',
    ],
    formatOptions: {
        resultsDir: 'allure-results',
    },
};
