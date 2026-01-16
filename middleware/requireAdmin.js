function requireAdmin(req, res, next) {
  if (!req.session.isAdmin) {
    return res.status(403).send("Forbidden");
  }
  next();
}

module.exports = requireAdmin;
