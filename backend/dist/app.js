"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Main health route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Sustainable E-Commerce + Circular Economy API is running', timestamp: new Date() });
});
const users_1 = __importDefault(require("./routes/users"));
const listings_1 = __importDefault(require("./routes/listings"));
const requests_1 = __importDefault(require("./routes/requests"));
const cart_1 = __importDefault(require("./routes/cart"));
const food_rescue_1 = __importDefault(require("./routes/food-rescue"));
const upcycle_1 = __importDefault(require("./routes/upcycle"));
const impact_1 = __importDefault(require("./routes/impact"));
const admin_1 = __importDefault(require("./routes/admin"));
const me_1 = __importDefault(require("./routes/me")); // Protected dummy route
app.use('/api/users', users_1.default);
app.use('/api/listings', listings_1.default);
app.use('/api/requests', requests_1.default);
app.use('/api/cart', cart_1.default);
app.use('/api/food-rescue', food_rescue_1.default);
app.use('/api/upcycle', upcycle_1.default);
app.use('/api/impact', impact_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/me', me_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});
// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});
exports.default = app;
