const express = require('express');
const app = express();
const db = require('./database');
const cors = require('cors');
const { validateStringParam, validateDiffParam } = require('./functions');

const allowedOrigins = [
    'http://*.reverier16.com',
    'https://*.reverier16.com'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) {
            // 服务器端发起的请求没有 origin 字段，允许通过
            return callback(null, true);
        }
        const isAllowed = allowedOrigins.some(pattern => {
        if (pattern.includes('*')) {
            const regexPattern = pattern.replace('*', '[^.]+');
            const regex = new RegExp(regexPattern);
            return regex.test(origin);
        }
        return pattern === origin;
        });

        if (isAllowed) {
        callback(null, true);
        } else {
        callback(new Error('Not allowed by CORS'));
        callback(null, false);
        }
    },
    methods: 'GET, POST, PUT, DELETE, PATCH',
    allowedHeaders: '*'
};

app.use(cors(corsOptions));

app.get('/reactions', validateStringParam('targetId'), (req, res) => {  // 获取特定 targetId 已收到的所有 reactions
    const targetId = req.query.targetId;
    db.getReactionsByTargetId(targetId, (err, rows) => {
        if (err) {
        console.error(err);
        return res.status(500).json({ code: 1, msg: `Database error: ${err.message}` });
        }
        res.json({ code: 0, msg: 'success', data: { reactionsGot: rows } });
    });
});

app.patch('/reaction', validateStringParam('targetId'), validateStringParam('reaction_name'), validateDiffParam, (req, res) => {
    const targetId = req.query.targetId;
    const reactionName = req.query.reaction_name;
    const diff = parseInt(req.query.diff);

    db.updateReaction(targetId, reactionName, diff, (err) => {  // 新增/更新一个 reaction
        if (err) {
        console.error(err);
        return res.status(500).json({ code: 1, msg: `Database error: ${err.message}` });
        }
        res.json({ code: 0, msg: 'success' });
    });
});

// 启动
const port = process.env.PORT || 9000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
