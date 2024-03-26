async function protect(req, res, next) {
  let token;

  if (
    req.headers.Authorization &&
    req.headers.Authorization.startsWith("samar")
  ) {
    token = req.headers.Authorization.split(" ")[1];
  }
  if (!token) {
    return res.status(403).send("Access denied");
  }
  console.log(token);
  next();
}

module.exports = { protect };
