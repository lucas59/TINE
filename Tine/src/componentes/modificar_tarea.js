import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, AsyncStorage, Keyboard } from 'react-native';
const { server } = require('../config/keys');
import { Button, Icon, Divider, Input } from 'react-native-elements';
import DateTimePicker from "react-native-modal-datetime-picker";
import moment from "moment";
import 'moment/min/moment-with-locales'

export default class Alta_tarea extends Component {
    static navigationOptions = {
        title: 'TINE',
        headerStyle: {
            backgroundColor: '#1E8AF1',
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
                color='#1E8AF1'
                onPress={() => console.log('perfil')} />
        ),

    };


    constructor(props) {
        super(props);
        this.state = {
            isDateTimePickerVisible_inicio: false,
            isDateTimePickerVisible_fin: false,
            tarea_id: '',
            tarea_titulo: '',
            tarea_inicio: '',
            tarea_fin: ''
        }
        this.obtener_tarea();
    }

    obtener_tarea = async () => {
        var tarea = await AsyncStorage.getItem('tarea_mod');
        var tarea_2 = JSON.parse(tarea);
        var hora_inicio = new Date(tarea_2[1]);
        var hora_fin = new Date(tarea_2[2]);
        this.setState({ tarea_id: tarea_2[0] });
        this.setState({ tarea_titulo: tarea_2[3]});
        this.setState({ tarea_inicio: hora_inicio});
        this.setState({ tarea_fin: hora_fin });
    }

    saveData = async () => {
        const { tarea_titulo, tarea_id, tarea_inicio, tarea_fin } = this.state;
        let loginDetails = {
            titulo: tarea_titulo,
            inicio: tarea_inicio,
            fin: tarea_fin,
            id: tarea_id
        }
        console.log(loginDetails);
        fetch(server.api + 'Modificar_tarea', {
            method: 'POST',
            headers: {
                'Aceptar': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginDetails)
        })
            .then(res => {
                return res.json()
            })
            .then(data => {
                const retorno = data;
                console.log(retorno.mensaje);
                if (retorno.retorno == true) {
                    alert("Exito");
                    AsyncStorage.setItem('tarea', JSON.stringify(loginDetails));
                    navigate(Signup);
                } else {
                    alert(retorno.mensaje);
                }
            })
            .catch(function (err) {
                console.log('error', err);
            })

        Keyboard.dismiss();
    }

    showDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: true });
    };

    hideDateTimePicker_inicio = () => {
        this.setState({ isDateTimePickerVisible_inicio: false });
    };

    showDateTimePicker_fin = () => {
        this.setState({ isDateTimePickerVisible_fin: true });
    };

    hideDateTimePicker_fin = () => {
        this.setState({ isDateTimePickerVisible_fin: false });
    };

    handleDatePicked_inicio = pickeddate => {
        var horafin_comp = moment(this.state.tarea_fin).format('HH:mm:ss');
        var horainicio_comp = moment(pickeddate).format('HH:mm:ss');
        var fechafin_comp = moment(this.state.tarea_fin).format('MMMM Do, YYYY');
        var fechainicio_comp = moment(pickeddate).format('MMMM Do, YYYY');
        console.log(horainicio_comp);
        if (fechafin_comp < fechainicio_comp) {
            var fin = moment(pickeddate).add(1, 'hours');
            this.setState({ tarea_fin: moment(fin).format() });
        }
        else if (fechafin_comp == fechainicio_comp && horafin_comp <= horainicio_comp) {
            var fin = moment(pickeddate).add(1, 'hours');
            this.setState({ tarea_fin: fin.format() });
        }
        this.setState({ tarea_inicio: moment(pickeddate).format() });
        this.setState({ tarea_fin: moment(this.state.tarea_fin).format() });
        this.hideDateTimePicker_inicio();
    };

    handleDatePicked_fin = pickeddate => {
        var horafin_comp = moment(pickeddate).format('HH:mm:ss');
        var horainicio_comp = moment(this.state.tarea_inicio).format('HH:mm:ss');
        var fechafin_comp = moment(pickeddate).format('MMMM Do, YYYY');
        var fechainicio_comp = moment(this.state.tarea_inicio).format('MMMM Do, YYYY');
        if (fechafin_comp < fechainicio_comp) {
            var fin = moment(pickeddate).subtract(1, 'hours');
            this.setState({ tarea_inicio: fin.format() });
        }
        else if (fechafin_comp == fechafin_comp && horafin_comp <= horainicio_comp) {
            var fin = moment(pickeddate).subtract(1, 'hours');
            this.setState({ tarea_inicio: fin.format() });
        }
        this.setState({ tarea_fin: moment(pickeddate).format() });
        this.setState({ tarea_inicio: moment(this.state.tarea_inicio).format() });
        this.hideDateTimePicker_fin();
    };

    render() {
        return (
            <View>
                <Input
                    onChangeText={(tarea_titulo) => this.setState({ tarea_titulo })}
                    value={this.state.tarea_titulo}
                    leftIcon={
                        { type: 'font-awesome', name: 'align-left' }
                    }
                />
                <Divider style={{ backgroundColor: 'blue' }} />
                <Button
                    title={moment(this.state.tarea_inicio).format('MMMM Do YYYY, HH:mm').toString()}
                    onPress={this.showDateTimePicker_inicio}
                    type="clear"
                />
                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible_inicio}
                    onConfirm={(date) => this.handleDatePicked_inicio(date)}
                    onCancel={this.hideDateTimePicker_inicio}
                    mode={'datetime'}
                    date={moment(this.state.tarea_inicio).toDate()}
                />
                <Divider style={{ backgroundColor: 'blue' }} />
                <Button
                    title={moment(this.state.tarea_fin).format('MMMM Do YYYY, HH:mm').toString()}
                    onPress={this.showDateTimePicker_fin}
                    type="clear"
                />
                <DateTimePicker
                    isVisible={this.state.isDateTimePickerVisible_fin}
                    onConfirm={(date) => this.handleDatePicked_fin(date)}
                    onCancel={this.hideDateTimePicker_fin}
                    mode={'datetime'}
                    date={moment(this.state.tarea_fin).toDate()}
                />
                <Divider style={{ backgroundColor: 'blue' }} />
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText} onPress={this.saveData}>Aceptar</Text>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    inputBox: {
        alignItems: 'center',
        width: 300,
        borderRadius: 25,
        paddingHorizontal: 16,
        fontSize: 16,
        marginVertical: 10
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        backgroundColor: '#4f83cc',
        borderRadius: 25,
        marginVertical: 10,
        paddingVertical: 12
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
        textAlign: 'center'
    }
});