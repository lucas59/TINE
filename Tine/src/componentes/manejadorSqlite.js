import { ToastAndroid } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const { server } = require('../config/keys');

var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = {};

manejador.subirTareas = () => {
    db.transaction(function (txn) {
        console.log('asd');
        txn.executeSql("SELECT * FROM tarea WHERE estado = 0", [], (tx, res) => {
            //  console.log(res.rows.length);
            //  ToastAndroid.show('tareas' + res.rows.length, ToastAndroid.SHORT);
            console.log('total: ', res.rows.length);

            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                  //  console.log("123",res.rows.item(i));
                    let tarea = {
                        id: res.rows.item(i).id,
                        titulo: res.rows.item(i).titulo,
                        inicio: res.rows.item(i).inicio,
                        fin: res.rows.item(i).fin,
                        empleado_id: res.rows.item(i).empleado_id,
                        empresa_id: res.rows.item(i).empresa_id,
                        lat_ini: res.rows.item(i).latitud_ini,
                        long_ini: res.rows.item(i).longitud_ini,
                        lat_fin: res.rows.item(i).latitud_fin,
                        long_fin: res.rows.item(i).longitud_fin
                    }
                    console.log("tarea: ",JSON.stringify(tarea))


                    fetch(server.api + 'Alta_tarea', {
                        method: 'POST',
                        headers: {
                            'Aceptar': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(tarea)
                    })
                        .then(res => {
                            return res.json()
                        })
                        .then(data => {
                            const retorno = data;
                            console.log(retorno.mensaje);
                            if (retorno.retorno == true) {
                                console.log("La tarea se dio de alta correctamente");
                                manejador.marcarTarea(tarea.id);
                            } else {
                                alert(retorno.mensaje);
                            }
                        })
                        .catch(function (err) {
                            console.log('error', err);
                        })

                }
            }

        });
    });

    db.transaction(function (txr) {
        txr.executeSql("SELECT * FROM ubicacion", [], (tx, res) => {
            console.log("cantubicaciones: ", res.rows.length);
        })
    })

}

manejador.marcarTarea = (id) => {
    console.log("id ",id)

    db.transaction(function(txn){
        txn.executeSql("UPDATE tarea SET estado=1 WHERE id = ?",[id], (tx,res)=>{
            console.log(res.rowsAffected)
            if (res.rowsAffected > 0) {
                console.log("Se modifico el estado de la tarea ", id);
            } else {
                console.log("error");
            }
        })
    })

}
manejador.subirAsistencias = () => {
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM asistencia WHERE estado = 0", [], (tx, res) => {
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    var datos = {
                        inicio: res.rows.item(i).inicio,
                        fin: res.rows.item(i).fin,
                        foto: res.rows.item(i).foto,
                        empleado_id: res.rows.item(i).empleado_id,
                    }
                    console.log(datos);

                    fetch(server.api + 'Alta_asistencia', {
                        method: 'POST',
                        headers: {
                            'Aceptar': 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(datos)
                    })
                        .then(res => {
                            return res.json()
                        })
                        .then(async data => {
                            if (retorno.retorno == true) {

                                alert(retorno.mensaje);
                            } else {
                                alert(retorno.mensaje);
                            }
                        })
                        .catch(function (err) {
                            console.log('error', err);
                        })


                }
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