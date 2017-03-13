// http://docs.sequelizejs.com/en/1.7.0/articles/express
// for bcyrpt - http://anneblankert.blogspot.com/2015/06/node-authentication-migrate-from.html
"use strict";

var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
    var patient = sequelize.define("patient", {
        // schema
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        hash: {
            type: DataTypes.STRING,
            allowNull: false
        },
        //   proPicUrl: { type: DataTypes.STRING, defaultValue: stockImage.url}
        surgeryType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            unique: true,
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
        age: DataTypes.INTEGER,
        weight: DataTypes.INTEGER,
        phoneProvider: DataTypes.STRING,
        surgeryNotes: DataTypes.TEXT,
        ptNotes: DataTypes.TEXT
    }, {
        classMethods: {
            associate: function(models) {
                patient.belongsTo(models.pt, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
                patient.hasMany(models.injury);
            },
            generateHash: function (hash) {
                return bcrypt.hashSync(hash, bcrypt.genSaltSync(8),null);  // think about doing this async if performance becomes noticeable
            },
        },
        instanceMethods: {
            validHash : function(hash) {
                return bcrypt.compareSync(hash, this.hash);
            }
        }
    });

    return patient;
};
