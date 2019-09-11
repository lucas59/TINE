import { ToastAndroid } from 'react-native';
import { openDatabase } from 'react-native-sqlite-storage';
const { server } = require('../config/keys');

var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = {};

manejador.subirTareas = () => {
    db.transaction(function (txn) {
        console.log('asd');
        txn.executeSql("SELECT * FROM tarea", [], (tx, res) => {
            //  console.log(res.rows.length);
            //  ToastAndroid.show('tareas' + res.rows.length, ToastAndroid.SHORT);
            console.log('total: ', res.rows.length);

            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {

                    let tarea_send = {
                        titulo: res.rows.item(i).titulo,
                        inicio: res.rows.item(i).inicio

                    }
                    console.log("tareas: ",tarea_send);

                    /*  fetch(server.api + 'Alta_tarea', {
                          method: 'POST',
                          headers: {
                              'Aceptar': 'application/json',
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(tarea_send)
                      })
                          .then(res => {
                              return res.json()
                          })
                          .then(data => {
                              const retorno = data;
                              console.log(retorno.mensaje);
                              if (retorno.retorno == true) {
                                  this.setState({ cargando: false });
                                  alert("La tarea se dio de alta correctamente");
                                  AsyncStorage.setItem('tarea', JSON.stringify(tarea_send));
                              } else {
                                  alert(retorno.mensaje);
                              }
                          })
                          .catch(function (err) {
                              console.log('error', err);
                          })
  
  */

                }
            }

        });
    });

}

manejador.subirAsistencia = () => {
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM asistencia", [], (tx, res) => {
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