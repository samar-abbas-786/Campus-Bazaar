const { getUser } = require("../service/auth");

async function restrictedToLoggedInUserOnly(req, res, next) {
  const userUid = req.cookies.uid;
  if (!userUid) return res.redirect("/login");

  const user = await getUser(userUid);
  if (!user) return res.redirect("/login");

  req.user = user;
  next();
}

module.exports = { restrictedToLoggedInUserOnly };
