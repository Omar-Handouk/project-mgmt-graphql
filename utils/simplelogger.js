import chalk from 'chalk';

/**
 * 
 * @param {string} level Log Level
 * @param {string} msg Log Message
 */
const simpleLogger = (msg, level = 'info') => {
    const normalizedLevel = level.toLocaleLowerCase();
    let style = undefined;

    switch (normalizedLevel) {
        case 'debug':
            style = chalk.white.bgGreen;
            break;
        case 'info':
            style = chalk.white.bgCyan;
            break;
        case 'warn':
            style = chalk.white.bgYellow;
            break;
        case 'error':
            style = chalk.white.bgHex('#FFA500')
            break;
        case 'fatal':
            style = chalk.white.bgRed;
            break;
        default:
    }
    
    console.log(`${style(`[${normalizedLevel}]`)}[${new Date().toISOString()}] - ${msg}`);
}

export default simpleLogger;