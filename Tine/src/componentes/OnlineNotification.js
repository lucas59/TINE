import React from 'react';

import {View, Text, Dimensions, StyleSheet} from 'react-native';

const {width} = Dimensions.get('window');

const styles = StyleSheet.create({
  offlineContainer: {
    backgroundColor: '#43B524',

    height: 30,

    justifyContent: 'center',

    alignItems: 'center',

    flexDirection: 'row',

    width,

    position: 'absolute',

    zIndex: 2000,

    bottom: 0,
  },

  offlineText: {color: '#fff'},
});

function MiniOfflineSign() {
  return (
    <View style={styles.offlineContainer}>
      <Text style={styles.offlineText}>Conexión establecida</Text>
    </View>
  );
}

export default MiniOfflineSign;
