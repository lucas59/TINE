import { openDatabase } from 'react-native-sqlite-storage';
import { ToastAndroid } from 'react-native';
const manejador = {};
var db = openDatabase({ name: 'sqlliteTesis.db' });

manejador.subirTareas = () => {
    console.log('entra');
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM tarea", [], function (tx, res) {
            console.log('cant',res.rows.length);
            ToastAndroid.show('tareas' + res.rows.length, ToastAndroid.SHORT);
        });
    });

}


manejador.borrarTareas = () => {
    ToastAndroid.show('pueba', ToastAndroid.LONG);
}

module.exports = manejador;