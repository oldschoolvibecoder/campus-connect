function notFound(req, res) { res.status(404).json({ error: 'Route not found.' }); }
function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
    if (error.name === 'ValidationError') return res.status(400).json({ error: Object.values(error.errors || {}).map((item) => item.message).join(' ') || error.message });
    if (error.code === 11000) return res.status(409).json({ error: 'This email is already registered.' });
    console.error(error.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
}
module.exports = { notFound, errorHandler };
