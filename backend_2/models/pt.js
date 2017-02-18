// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

module.exports = function(sequelize, DataTypes) {
    var PT = sequelize.define("PT", {
        // schema
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Patient.hasMany(models.Patient)
            }
        }
    });
   
    return PT;
};
