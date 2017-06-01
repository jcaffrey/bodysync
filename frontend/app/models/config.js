module.exports = {
    port:  process.env.PORT || 3001,

    // location of backend, do not include trailing /
    apiUrl: process.env.APIURL || 'http://localhost:3000',

    // secret for creating tokens
    secret: 'thisisthesecret'
};
