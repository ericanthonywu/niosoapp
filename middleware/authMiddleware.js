const jwt = require('jsonwebtoken')
const { validationResult } = require('express-validator');
const path = require('path');

/**
 * JWT middleware with body validator
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
exports.authMiddleware = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {token, role} = req.headers
    if (!token) return res.status(400).json({message: "Token auth required at header:token"})
    jwt.verify(token, process.env.JWTSECRETTOKEN, (err, data) => {
        if (err) {
            res.status(419).json(err)
            if (req.files) {
                for (let i = 0; i < req.files.length; i++) {
                    fs.unlinkSync(path.join(__dirname, `../uploads/${req.dest}/${req.files[i].filename}`))
                }
            } else if (req.file) {
                fs.unlinkSync(path.join(__dirname, `../uploads/${req.dest}/${req.file.filename}`))
            }
            return;
        }

        if (data.role !== role){
            return res.status(401).json({message: "role isn't match"})
        }

        res.userData = data;
        next()
    })
}
