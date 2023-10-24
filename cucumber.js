let common = [
    'src/__tests__/acceptance/features/*.feature',                    // Specify our feature files
    '--require-module ts-node/register',                              // Load TypeScript module
    '--require dist/__tests__/acceptance/step-definitions/**/*.js',   // Load step definitions
    '--require dist/__tests__/acceptance/hooks/**/*.js'               // Load hooks
].join(' ');

module.exports = {
    default: common
};