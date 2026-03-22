exports.isGuest = (req, res, next) => {
  if (!req.session.isLoggedIn) return res.redirect("/login");
  if (req.session.user.userType !== "guest") {
    return res.status(403).send("Access denied. Guests only.");
  }
  next();
};

exports.isHost = (req, res, next) => {
  if (!req.session.isLoggedIn) return res.redirect("/login");
  if (req.session.user.userType !== "host") {
    return res.status(403).send("Access denied. Hosts only.");
  }
  next();
};

exports.isLoggedIn = (req, res, next) => {
  if (!req.session.isLoggedIn) return res.redirect("/login");
  next();
};
