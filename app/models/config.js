module.exports = {
    port:  process.env.PORT || 3001,

    // location of backend, do not include trailing /
    apiUrl: process.env.apiUrl ||'http://bodysync-api.h8wv74ic.healthcareblocks.com',

    // secret for creating tokens
    secret: 'thisisthesecret',

    // AWS photo upload settings
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'AKIAI5SG5LBSUSQCYM4Q',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY ||'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',
    S3_BUCKET: process.env.S3_BUCKET || 'bodysync-photo-upload'
};