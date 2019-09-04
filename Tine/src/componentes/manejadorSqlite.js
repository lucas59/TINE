import { ToastAndroid } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const { server } = require('../config/keys');

var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = {};

manejador.subirTareas = () => {
    console.log('entra');
    db.transaction(function (txn) {
        console.log('asd');
        txn.executeSql("SELECT * FROM usuario", [], (tx, res) => {
            console.log(res.rows.length);
            ToastAndroid.show('tareas' + res.rows.length, ToastAndroid.SHORT);
        });
    });

}

manejador.bajarEmpleadosEmpresa = (documento) => {
    console.log(documento);
    var url = server.api + 'misEmpleados?documento=' + documento;

    db.transaction(function (txn) {
        txn.executeSql("DELETE FROM usuario", [], function (tx, res) {
            console.log(res.rowsAffected);
            console.log("vaciando lista");
        })
    })

    fetch(url)
        .then(res => {
            return res.json()
        })
        .then(data => {
            var filas = data['filas'];
            filas.forEach(element => {
                db.transaction(function (txn) {
                    txn.executeSql("INSERT INTO `usuario`(`id`, `pin`) VALUES (?,?)", [element.documento, element.pin], (tx, res) => {
                        if (res.rowsAffected) {
                            console.log("Usuario agregado");
                        }
                    });
                })
            });
        })
        .catch(function (err) {
            console.log("error: ", err)
            ToastAndroid.show("Compruebe su conexión", ToastAndroid.LONG);
        })
}


manejador.borrarTareas = () => {
    ToastAndroid.show('pueba', ToastAndroid.LONG);
}

module.exports = manejador;