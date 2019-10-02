import React, { Component } from 'react';
import { Text, View, ToastAndroid, PermissionsAndroid } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-community/async-storage';
const { server } = require('../config/keys');
import { Icon } from 'react-native-elements';
import { Stopwatch } from 'react-native-stopwatch-timer';
//import Geolocation from '@react-native-community/geolocation';
import Geolocation from 'react-native-geolocation-service';
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import { openDatabase } from 'react-native-sqlite-storage';
var db = openDatabase({ name: 'sqlliteTesis.db', createFromLocation: 1 });
import styles from '../css/styleAlta_tarea';
import { Button } from 'react-native-paper';
export default class Alta_tarea extends Component {
    comprobar_conexion() {
        NetInfo.isConnected.fetch().done((isConnected) => {
            if (isConnected == true) {
                this.setState({ connection_Status: "Online" });
                console.log("online");
            }
            else {
                this.setState({ connection_Status: "Offline" });
            }
        })
    }
    componentDidMount() {
        this.comprobar_conexion();
    }

    static navigationOptions = ({ navigation }) => {
        return {
            title: 'TINE',
            headerStyle: {
                backgroundColor: '#008FAD',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: (
                <Icon
                    reverse
                    name='face'
                    type='material'
                    color='#008FAD'
                    onPress={async () => navigation.navigate('perfil', { session: await AsyncStorage.getItem('usuario') })} />
            ),
        }
    };

    constructor(props) {
        super(props);
        this.state = {
            titulo: '',
            inicio: '',
            fin: '',
            timerStart: false,
            stopwatchStart: false,
            totalDuration: 90000,
            timerReset: false,
            stopwatchReset: false,
            long_ini: null,
            lat_ini: null,
            lat_fin: null,
            long_fin: null,
            cargando: false
        };
        this.toggleStopwatch = this.toggleStopwatch.bind(this);
        this.resetStopwatch = this.resetStopwatch.bind(this);

    }


    toggleStopwatch = async () => {
        this.setState({ stopwatchStart: !this.state.stopwatchStart, stopwatchReset: false });
        let fecha = moment(new Date()).format();
        var longitud;
        var latitud;
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            Geolocation.getCurrentPosition(
                (position) => {
                    longitud = JSON.stringify(position.coords.longitude);
                    latitud = JSON.stringify(position.coords.latitude);
                    if (this.state.stopwatchStart) {
                        console.log("inicio" + longitud);
                        console.log("inicio" + latitud);
                        this.setState({ inicio: fecha });
                        this.setState({ long_ini: longitud });
                        this.setState({ lat_ini: latitud });
                    } else {
                        console.log("fin" + longitud);
                        console.log("fin" + latitud);
                        this.setState({ fin: fecha });
                        this.setState({ long_fin: longitud });
                        this.setState({ lat_fin: latitud });
                        this.saveData();
                    }
                },
                (error) => alert(error.message),
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
            );
        } else {
            alert("Location permission denied")
        }



    }

    resetStopwatch() {
        this.setState({ stopwatchStart: false, stopwatchReset: true });
        this.setState({ inicio: '' })
        this.setState({ fin: '' })
    }

    getFormattedTime(time) {
        this.currentTime = time;
    };

    promesa() {
        return new Promise(function (resolve, reject) {
            setTimeout(() => {
                db.transaction(function (txn) {
                    txn.executeSql("SELECT seq FROM sqlite_sequence where name = 'tarea'", [], (tx, res) => {
                        resolve(res.rows.item(0).seq);
                    });
                });
            }, 1000);
        });
    }

    saveData = async () => {
        this.comprobar_conexion();
        this.setState({ cargando: true });
        let myArray = await AsyncStorage.getItem('empresa');
        let session = await AsyncStorage.getItem('usuario');
        let sesion = JSON.parse(session);
        let empresa_id = JSON.parse(myArray);
        const { titulo, inicio, fin, long_ini, lat_ini, long_fin, lat_fin } = this.state;
        let tarea_send = {
            titulo: titulo,
            inicio: inicio,
            fin: fin,
            long_ini: long_ini,
            lat_ini: lat_ini,
            long_fin: long_fin,
            lat_fin: lat_fin,
            empleado_id: sesion.id,
            empresa_id: empresa_id[0]

        }
        console.log(tarea_send);
        console.log("estado: ", this.state.connection_Status);
        if (this.state.connection_Status == "Offline") {
            console.log(fin);
            console.log(inicio);
            console.log(titulo);
            console.log(tarea_send.empleado_id);
            console.log(tarea_send.empresa_id);
            console.log("latitud ini: " + lat_ini);
            console.log("long ini: " + long_ini);
            console.log("latitud fin: " + lat_fin);
            console.log("long fin: " + long_fin);
            var ult_tarea;
            db.transaction(function (txx) {
                txx.executeSql('INSERT INTO tarea (fin, inicio,titulo,empleado_id,empresa_id, latitud_ini, longitud_ini, latitud_fin, longitud_fin, estado) VALUES (?,?,?,?,?,?,?,?,?,?)', [fin, inicio, titulo, tarea_send.empleado_id, tarea_send.empresa_id, lat_ini, long_ini, lat_fin, long_fin, 0], (tx, results) => {
                    if (results.rowsAffected > 0) {
                        console.log("insertó");
                    } else {
                        console.log("error");
                    }
                }
                );
            });
            ToastAndroid.show('La tarea se ingresó correctamente', ToastAndroid.LONG);
            this.props.navigation.navigate('lista_tareas');

        }
        else {
            fetch(server.api + 'Alta_tarea', {
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
                        ToastAndroid.show('La tarea se ingresó correctamente', ToastAndroid.LONG);
                        AsyncStorage.setItem('tarea', JSON.stringify(tarea_send));
                        this.props.navigation.navigate('lista_tareas');
                    } else {
                        alert(retorno.mensaje);
                    }
                })
                .catch(function (err) {
                    console.log('error', err);
                })
        }
    }


    render() {
        return (


            <View style={styles.container}>
                <Stopwatch laps msecs start={this.state.stopwatchStart}
                    reset={this.state.stopwatchReset}
                    options={options}
                    msecs={false}
                    getTime={this.getFormattedTime} />
                <TextInput
                    label="Titulo de la tarea"
                    style={{ width: 300, fontSize: 20, marginTop: 30, marginBottom: 30 }}
                    onChangeText={(titulo) => this.setState({ titulo })}
                    placeholder="¿En qué estás trabajando?"
                    selectionColor="#008FAD"
                    underlineColor="#008FAD"
                    autoFocus={true}
                    theme={{
                        colors: {
                            primary: '#008FAD',
                            underlineColor: 'transparent',
                        }

                    }}
                    value={this.state.titulo}
                />
                <Button style={{ width: 160, height: 50 }} color="#008FAD" mode={!this.state.stopwatchStart ? "outlined" : "contained"} onPress={this.toggleStopwatch}>
                    <Text style={{ fontSize: 23 }}>{!this.state.stopwatchStart ? "Iniciar" : "Parar"}</Text>
                </Button>

            </View>

        )
    }
}

const options = {
    container: {
        backgroundColor: '#E8E8E8',
        padding: 5,
        borderRadius: 200,
        borderWidth: 6,
        borderColor: '#008FAD',
        width: 260,
        height: 260,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 50,
        color: 'black',
    },
};

