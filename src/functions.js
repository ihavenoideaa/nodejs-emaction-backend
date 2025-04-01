const validateStringParam = (paramName) => {
    return (req, res, next) => {
        const param = req.query[paramName];
        if (typeof param !== 'string' || param.trim() === '') { // 验证 targetId 和 reaction_name 是否为字符串
        return res.status(400).json({ code: 1, msg: `Invalid ${paramName}` });
        }
        next();
    };
};

const validateDiffParam = (req, res, next) => {
    const diff = parseInt(req.query.diff);
    if (isNaN(diff) || (diff !== 1 && diff !== -1)) { // 验证 diff 是否为1或-1
        return res.status(400).json({ code: 1, msg: 'Invalid diff, must be 1 or -1' });
    }
    next();
};

module.exports = {
    validateStringParam,
    validateDiffParam
};
