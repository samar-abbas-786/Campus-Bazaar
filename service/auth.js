// const jwt = require("jsonwebtoken");
// const secret = "Samar@123#";

// function setuser(user) {
//   return jwt.sign(
//     {
//       _id: user._id,
//       Name: user.Name,
//       email: user.email,
//     },
//     secret
//   );
// }
// function getuser(token) {
//   if (!token) return null;
//   return jwt.verify(token, secret);
// }

// module.exports = {
//   setuser,
//   getuser,
// };

const sessionIdtoUserMap = new Map();

function setuser(id, user) {
  sessionIdtoUserMap.set(id, user);
}

function getuser(id) {
  return sessionIdtoUserMap.get(id);
}

module.exports = {
  setuser,
  getuser,
};
