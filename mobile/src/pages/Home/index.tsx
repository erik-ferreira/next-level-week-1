import React, { useState, useEffect } from 'react'
import { View, Text, Image, ImageBackground, TextInput, KeyboardAvoidingView, Platform } from 'react-native'
import { Feather as Icon } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import { Picker } from '@react-native-picker/picker'
import axios from 'axios'

interface UfsProps {
  id: number;
  sigla: string;
}

interface CityProps {
  nome: string;
}

import styles from './style'

const Home = () => {
  const navigation = useNavigation()

  const [ufs, setUfs] = useState<UfsProps[]>([])
  const [cities, setCities] = useState<string[]>([])

  const [selectedUf, setSelectedUf] = useState('0')
  const [selectedCity, setSelectedCity] = useState('0')

  useEffect(() => {
    axios.get<UfsProps[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(response => {
      const listUfs = response.data
        .map(uf => ({ id: uf.id, sigla: uf.sigla }))
        .sort((a, b) => ((a.sigla > b.sigla) ? 1 : ((b.sigla > a.sigla) ? -1 : 0)))

      setUfs(listUfs)
    })
  }, [])

  useEffect(() => {
    if(selectedUf === '0') {
      setCities([])
      return
    }

    axios.get<CityProps[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`).then(response => {
      const cityNamesList = response.data.map(city => city.nome)

      setCities(cityNamesList)
    })

  }, [selectedUf])

  function handleNavigationToPoints() {
    navigation.navigate('Points', {
      selectedUf,
      selectedCity
    })
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} >
      <ImageBackground
        source={require('../../assets/home-background.png')}
        style={styles.container}
        imageStyle={{ width: 274, height: 368 }}
      >
        <View style={styles.main}>
          <Image source={require('../../assets/logo.png')} />
          <View>
            <Text style={styles.title}>Seu marktplace de coleta de resíduos</Text>
            <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Picker
            onValueChange={(value) => setSelectedUf(String(value))}
            style={styles.selectInput}
            selectedValue={selectedUf}
          >
            <Picker.Item  label="Selecione a UF" value="0" />
            {ufs.map(uf => (
              <Picker.Item key={uf.id} label={uf.sigla} value={uf.sigla} />
            ))}
          </Picker>

          <Picker
            onValueChange={(value) => setSelectedCity(String(value))}
            style={styles.selectInput}
            selectedValue={selectedCity}
          >
            <Picker.Item label="Selecione a cidade" value="0" />
            {cities.map(city => (
              <Picker.Item key={city} label={city} value={city} />
            ))}
          </Picker>

          <RectButton style={styles.button} onPress={handleNavigationToPoints}>
            <View style={styles.buttonIcon}>
              <Text>
                <Icon name="arrow-right" color="#FFF" size={24} />
              </Text>
            </View>
            <Text style={styles.buttonText}>
              Entrar
            </Text>
          </RectButton>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  )
}

export default Home