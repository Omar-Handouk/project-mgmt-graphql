/**
 * 
 * @param {string} level Log Level
 * @param {string} msg Log Message
 */
const simpleLogger = (msg, level = 'info') => {
    console.log(`[${level.toLocaleUpperCase()}][${new Date().toISOString()}] - ${msg}`);
}

export default simpleLogger;