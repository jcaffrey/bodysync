// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

var bcrypt = require('bcrypt-nodejs');


module.exports = function(sequelize, DataTypes) {
    var pt = sequelize.define("pt", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            //unique: true,
            allowNull: false,
            validate: {
                isEmail : true
            }
        },
        token: {
            type: DataTypes.STRING
        },
        phoneNumber: {
            type: DataTypes.STRING
        },
          //proPicUrl: { type: DataTypes.STRING, defaultValue: stockImage.url}
        phoneProvider: {
            type: DataTypes.STRING
        },
        // temp
        isAdmin: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        }
    }, {
        classMethods: {
            associate: function(models) {
                pt.hasMany(models.patient);
            },
            generateHash: function(hash) {
                return bcrypt.hashSync(hash, bcrypt.genSaltSync(8), null);
            },
        },
        instanceMethods: {
            validHash : function(hash) {
                return bcrypt.compareSync(hash, this.hash);
            }
        }
    });






    // ,
    //     instanceMethods:
    //         {
    //             validHash: function (hash) {
    //                 return bcrypt.compareSync(hash, this.hash);
    //             }
    //         }
    // })

    //
    //     {
    //     classMethods: {
    //         associate: function(models) {
    //             pt.hasMany(models.patient);
    //            // PT.hasMany(models.exerciseSet);
    //         }
    //     },
    //         generateHash: function (hash) {
    //             return bcrypt.hashSync(hash, bcrypt.genSaltSync(8),null);  // think about doing this async if performance becomes noticeable
    //         }
    //     },
    //     instanceMethods: {
    //         validHash : function(hash) {
    //             return bcrypt.compareSync(hash, this.hash);
    //         }
    //     }
    // });
   
    return pt;
};
