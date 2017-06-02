module.exports = {
    port:  process.env.PORT || 3001,

    // location of backend, do not include trailing /
    apiUrl: 'https://whispering-refuge-74086.herokuapp.com/',

    // secret for creating tokens
    secret: 'thisisthesecret',

    // AWS photo upload settings
    AWS_ACCESS_KEY_ID: 'AKIAI5SG5LBSUSQCYM4Q',
    AWS_SECRET_ACCESS_KEY: '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',
    S3_BUCKET: 'bodysync-photo-upload'
};
