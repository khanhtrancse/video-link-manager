function requiresUnLogin(req, res, next) {
    if (req.session && req.session.userId) {
        res.redirect('/');
    } else {
        return next();
    }
}

function requiresLogin(req, res, next) {
    if (req.session && req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
}

function requiresFullInfoUser(req, res, next) {
    if (req.session && req.session.userId) {
        if (req.session.hasInfo) {
            return next();
        } else {
            res.redirect('/update-user-info');
        }
    } else {
        res.redirect('/login');
    }
}

    module.exports = {
        requiresLogin,
        requiresFullInfoUser,
        requiresUnLogin
    }

