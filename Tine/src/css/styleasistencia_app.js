import { StyleSheet } from 'react-native';
module.exports = StyleSheet.create({
    view_cargando: {
        flex: 1,
            backgroundColor: '#00748D',
            justifyContent: 'center',
            alignItems: 'center',
    },
    view_boton: {
        position: 'relative',
        bottom: 20,
        left: 0,
        right: 0

    },
    camara: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        flex: 0,
        backgroundColor: '#00748D',
        borderRadius: 5,
        padding: 15,
        alignSelf: 'center',
        paddingHorizontal: 20,
        margin: 20,
    },
    main: {
        flex: 1,
    },
    boton: {
        borderRadius: 30,
        width: 200,
        height: 45
    },
    boton_capturar: {
        fontSize: 14,
        color: 'white'
    },
    view_nocamara: {
        top: 15,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 600
    },
    imagen_camaraimagen: {
        width: 300,
        height: 250
    },
    texto_camaraimagen: {
        fontSize: 19,
        textAlign: 'center'
    }
});