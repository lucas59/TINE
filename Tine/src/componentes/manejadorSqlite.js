import Toast from 'react-native-simple-toast';
import { openDatabase } from 'react-native-sqlite-storage';
const { server } = require('../config/keys');
import AsyncStorage from '@react-native-community/async-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
const manejador = require("./manejadorSqlite");
var PushNotification = require("react-native-push-notification");

manejador.subirTareas = () => {
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM tarea WHERE estado = 0", [], (tx, res) => {
            if (res.rows.length > 0) {
                PushNotification.localNotification({
                    id: '1',
                    priority: "high",
                    importance: "high",
                    title: "Conexión con el servidor",
                    message: "Subiendo tareas",
                });
                for (var i = 0; i < res.rows.length; i++) {
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
                            PushNotification.cancelAllLocalNotifications();
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



promesasubirAsistencia = async (datos) => {
    PushNotification.localNotification({
        id: '1',
        priority: "high",
        importance: "high",
        title: "Conexión con el servidor",
        message: "Subiendo asistencias",
    });
    return new Promise(function (resolve, reject) {
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

                if (data.retorno == true) {
                    console.log("La marca se dio de alta correctamente");
                    marcarAsistencia(datos.id).then((retorno) => {
                        console.log("retorno de marca: ", retorno);
                        resolve(true);
                    });
                    PushNotification.cancelAllLocalNotifications();
                } else {
                    console.log("Error al subir la asistencia");
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })
    });
}

marcarAsistencia = async (id) => {
    return new Promise(function (resolve, reject) {
        db.transaction(function (txn) {
            txn.executeSql("UPDATE asistencia SET estado=1 WHERE id = ?", [id], (tx, res) => {
                console.log(res.rowsAffected)
                if (res.rowsAffected > 0) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            })
        })
    });
}

manejador.marcarTarea = (id) => {
    console.log("id ", id)

    db.transaction(function (txn) {
        txn.executeSql("UPDATE tarea SET estado=1 WHERE id = ?", [id], (tx, res) => {
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
    console.log("subiendo asis");
    db.transaction(function (txn) {
        txn.executeSql("SELECT * FROM asistencia WHERE estado = 0 ", [], (tx, res) => {
            if (res.rows.length > 0) {
                for (var i = 0; i < res.rows.length; i++) {
                    var datos = {
                        id: res.rows.item(i).id,
                        fecha: res.rows.item(i).fecha,
                        foto: res.rows.item(i).foto,
                        empleado_id: res.rows.item(i).empleado_id,
                        estado: res.rows.item(i).tipo,
                        empresa_id: res.rows.item(i).empresa_id
                    }

                    console.log("datos: ", datos);

                    promesasubirAsistencia(datos).then((retorno) => {
                        console.log("retornoFinal: ", retorno);
                    });

                    /*  fetch(server.api + 'Alta_asistencia', {
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
                              console.log("data", data);
  
                              if (data.retorno == true) {
                                  console.log("La marca se dio de alta correctamente");
                                  manejador.marcarAsistencia(datos.id);
                              } else {
                                  console.log("Error al subir la asistencia");
                              }
                          })
                          .catch(function (err) {
                              console.log('error', err);
                          })
  */

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
            Toast.show("Compruebe su conexión");
        })
}


manejador.borrarTareas = () => {
    Toast.show('pueba');
}

manejador.listarempresas = (id_usuario) => {
    db.transaction(function (txnn) {
        txnn.executeSql("DELETE FROM empresa", [], function (tx, res) {
            console.log(res.rowsAffected);
            console.log("vaciando lista");
        })
    })
    let tarea_send = {
        id: id_usuario
    }
    console.log(tarea_send);
    fetch(server.api + '/Tareas/ListaEmpresas', {
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
            var filas = data['mensaje'];
            console.log(filas);
            filas.forEach(element => {
                console.log(element.id);
                console.log(element.nombre);
                db.transaction(function (txo) {
                    txo.executeSql("INSERT INTO `empresa`(`id`, `nombre`) VALUES (?,?)", [element.id, element.nombre], (tx, res) => {
                        console.log(res.rowsAffected);
                        if (res.rowsAffected > 0) {
                            console.log("empresa agregada");
                        }
                    });
                })
            });
        })
        .catch(function (err) {
            console.log('error', err);
        })
}

module.exports = manejador;