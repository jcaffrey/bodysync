// http://docs.sequelizejs.com/en/1.7.0/articles/express

"use strict";

module.exports = function(sequelize, DataTypes) {
    var Patient = sequelize.define("Patient", {
        // schema
        name: DataTypes.STRING
    }, {
        classMethods: {
            associate: function(models) {
                Patient.belongsTo(models.PT, {
                    //onDelete: "CASCADE",
                    foreignKey: {
                        allowNull: false
                    }
                });
            }
        }
    });
   
    return Patient;
};
