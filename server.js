const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
const apiRouter = require('./routes/api');
const { seedInitialData } = require('./utils/seed');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', apiRouter);
app.use(notFound);
app.use(errorHandler);

async function startApp() {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    await seedInitialData();

    const port = Number(process.env.PORT) || 3000;
    const server = app.listen(port, () => console.log(`CampusConnect is running at http://localhost:${port}`));

    const shutdown = async () => {
        server.close();
        await mongoose.disconnect();
        await mongoServer.stop();
    };
    process.once('SIGINT', shutdown);
    process.once('SIGTERM', shutdown);
}

startApp().catch((error) => {
    console.error('Unable to start CampusConnect:', error.message);
    process.exit(1);
});
