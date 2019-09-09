import { ToastAndroid } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const { server } = require('../config/keys');

var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = {};

manejador.subirTareas = () => {
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM tarea", [], (tx, res) => {
            console.log(res.rows.length);
            ToastAndroid.show('tareas' + res.rows.length, ToastAndroid.SHORT);
        });
    });

}

manejador.subirAsistencia = () => {
    console.log("subiendo asistencias");
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM asistencia", [], (tx, res) => {
            if (res.rows.length > 0) {
                res.rows.forEach(element => {
                    console.log(element.fin);
                
                });
            } else {
                console.log("no hay asistencias");
            }
        });
    });

}

manejador.bajarEmpleadosEmpresa = (documento) => { ///baja los empleado al iniciar una session empresa
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