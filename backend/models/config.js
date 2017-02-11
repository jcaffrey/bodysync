module.exports = {
    //port: process.env.PORT || 3000,
    port: 3000,
    
    // dbUrl:'mongodb://dormsupplies:dormsupplies@ds163718.mlab.com:63718/heroku_vn743b35',
     dbUrl: 'localhost:5000',
    
    // for signing tokens
    secret: 'asdgydfughjxckhcf2t4ey',

    // for first admin
    adminEmail: 'jeremy.welborn@gmail.com',
    adminPassword: 'asdf',

    // for sending emails
    // TODO change this email
    emailFromName: 'BodySync test',
    emailFromAddress: 'jeremy.welborn@gmail.com',
    emailPassword: 'asdf',
    venmoAccount: '@venmoAccountGoesHere',
    
};
