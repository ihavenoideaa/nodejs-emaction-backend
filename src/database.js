const sqlite3 = require('sqlite3').verbose();

// 连接到 SQLite 数据库
const db = new sqlite3.Database('emaction.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the emaction database.');

    db.serialize(() => {    // 创建 reactions 表
        db.run(`
        CREATE TABLE IF NOT EXISTS reactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            target_id TEXT NOT NULL,
            reaction_name TEXT NOT NULL,
            count INTEGER NOT NULL,
            created_at INTEGER NOT NULL,
            updated_at INTEGER NOT NULL
        )
        `);
    });
});

const getReactionsByTargetId = (targetId, callback) => {  // 获取特定 targetId 已收到的所有 reactions
    db.all('SELECT reaction_name, count FROM reactions WHERE target_id = ?', [targetId], callback);
};

const updateReaction = (targetId, reactionName, diff, callback) => {  // 新增/更新一个 reaction
    db.get('SELECT count FROM reactions WHERE target_id = ? AND reaction_name = ?', [targetId, reactionName], (err, row) => {
    if (err) {
        return callback(err);
    }

    if (row) {
        const newCount = Math.max(0, row.count + diff);
        const now = Date.now();
        db.run('UPDATE reactions SET count = ?, updated_at = ? WHERE target_id = ? AND reaction_name = ?', [newCount, now, targetId, reactionName], callback);  // 更新
    } else {
        const now = Date.now();
        db.run('INSERT INTO reactions (target_id, reaction_name, count, created_at, updated_at) VALUES (?, ?, ?, ?, ?)', [targetId, reactionName, Math.max(0, diff), now, now], callback);  // 新记录
    }
    });
};

module.exports = {
    getReactionsByTargetId,
    updateReaction
};
