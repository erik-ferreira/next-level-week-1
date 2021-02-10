import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image, SafeAreaView, Linking } from 'react-native'
import { Feather as Icon, FontAwesome } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { useNavigation, useRoute } from '@react-navigation/native'
import api from '../../services/api'
import * as MailComposer from 'expo-mail-composer'

import styles from './style'

interface RouteParams {
  point_id: number;
}

interface DataParams {
  points: {
    image: string;
    image_url: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
  };
  items: {
    title: string;
  }[];
}

const Detail = () => {
  const [data, setData] = useState<DataParams>({} as DataParams)
  const { points, items } = data

  const navigation = useNavigation()
  const route = useRoute()

  const { point_id } = route.params as RouteParams
  
  useEffect(() => {
    api.get(`/points/${point_id}`).then(response => {
      setData(response.data)
    })
  }, [])

  function handleNavigateBack() {
    navigation.goBack()
  }

  function handleComposeMail() {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [points.email],
    })
  }

  function handleWhatsapp() {
    Linking.openURL(`whatsapp://send?phone=${points.whatsapp}&text=Tenho interesse sobre a coleta de resíduos`)
  }
  
  if(!data.points) {
    return null
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={24} color="#34CB79" />
        </TouchableOpacity>

        <Image
          style={styles.pointImage}
          source={{ uri: points.image_url }}
        />

        <Text style={styles.pointName}> {points.name} </Text>
        <Text style={styles.pointItems}>
          {items.map(item => item.title).join(', ')}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>Endereco</Text>
          <Text style={styles.addressContent}>{points.city}, {points.uf}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesome name="whatsapp" size={20} color="#FFF" />
          <Text style={styles.buttonText}>Whatsapp</Text>
        </RectButton>

        <RectButton style={styles.button} onPress={handleComposeMail}>
          <Icon name="mail" size={20} color="#FFF" />
          <Text style={styles.buttonText}>E-mail</Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

export default Detail