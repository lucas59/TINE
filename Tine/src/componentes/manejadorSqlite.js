import { ToastAndroid } from 'react-native';

import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation : 1});


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


manejador.borrarTareas = () => {
    ToastAndroid.show('pueba', ToastAndroid.LONG);
}

module.exports = manejador;