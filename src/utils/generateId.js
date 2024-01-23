
/**
 * Create a new id.
 *
 * @param {string} text - The text form creating the id.
 * @returns {string} - id generated according to provied value.
 */
exports.generateId = (text) => `${text}-${Date.now().toString().slice(-4)}-${Math.floor(10 + Math.random() * 90)}`;